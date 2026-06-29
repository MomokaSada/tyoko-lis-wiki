import { logger } from '@/server/lib/logger';

import type {
    CreateContentInput,
    DeleteContentInput,
    UpdateContentInput,
} from '@/server/schemas';
import {
    createContentWithInitialRevision,
    deleteContentById,
    findContentSummaryById,
    findPublishedContentBySlug,
    findEditableContentBySlug,
    findContentBySlug,
    getSitemapContentList as getSitemapContentListRepo,
    getHomePageContentList,
    countPublishedContents,
    incrementContentViewCount,
    listVisibleContents,
    searchVisibleContents,
    updateContentWithRevision,
    countVisibleContents,
    getWeeklyPopularContents,
} from '@/server/repositories/contentRepository';
import type {
    ContentSortKey,
    SortOrder,
} from '@/server/types/repositoryTypes';

import { EditorContext } from '@/server/lib/currentEditor';

type VisibleContentRow = NonNullable<Awaited<ReturnType<typeof listVisibleContents>>>[number];

import {
    commonErrors,
    serviceErrors,
} from '@/server/errors';
import {
    detectTaxonomyChanges,
    getContentTaxonomyState,
    getTaxonomyOptions,
    resolveTaxonomySelection,
} from '@/server/services/taxonomyService';

export type CreateContentResult =
  | {
    success: true;
    data: {
      id: number;
      slug: string;
      title: string;
    };
  }
  | {
    success: false;
    error: string;
  };

export async function createContent(
  editor: EditorContext,
  input: CreateContentInput,
  options?: {
    deviceSessionId?: number | null;
  },
): Promise<CreateContentResult> {
  if (!input.slug) {
    return {
      success: false,
      error: serviceErrors.content.slugGenerateFailed,
    };
  }

  const existing = await findContentBySlug(input.slug);

  if (existing) {
    return {
      success: false,
      error: serviceErrors.content.slugAlreadyUsed,
    };
  }

  const resolvedTaxonomy = await resolveTaxonomySelection({
    existingTagIds: input.tagIds,
    newTags: input.newTags,
    existingCategoryIds: input.categoryIds,
    newCategoryName: input.newCategoryName,
    newCategoryParentId: input.newCategoryParentId,
  });

  const effectiveIsPublished = editor.type === 'actor' ? input.isPublished : true;

  const created = await createContentWithInitialRevision({
    slug: input.slug,
    title: input.title,
    content: input.content,
    thumbnail: input.thumbnail,
    isPublished: effectiveIsPublished,
    userId: editor.type === 'actor' ? editor.actorId : null,
    sessionId: editor.type === 'session' ? editor.sessionId : null,
    deviceSessionId: options?.deviceSessionId ?? null,
    tagIds: resolvedTaxonomy.tagIds,
    categoryIds: resolvedTaxonomy.categoryIds,
    tagChanged: resolvedTaxonomy.tagIds.length > 0,
    categoryChanged: resolvedTaxonomy.categoryIds.length > 0,
  });

  return {
    success: true,
    data: {
      id: created.id,
      slug: created.slug,
      title: created.currentTitle,
    },
  };
}

export async function getSitemapContentList() {
  return getSitemapContentListRepo();
}

export async function searchVisibleContentList(
  query: string,
  includeUnpublished: boolean,
  sort?: ContentSortKey,
  order?: SortOrder,
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number
): Promise<{
  posts: (VisibleContentRow & { excerpt: string })[];
  pagination: { totalCount: number; totalPages: number; currentPage: number; pageSize: number };
  error?: string;
}> {
  const trimmedQuery = query.trim();
  const offset = (page - 1) * pageSize;
  const searchQuery = trimmedQuery || undefined;

  let totalCount = 0;
  let rows: Awaited<ReturnType<typeof listVisibleContents>> = [];

  try {
    const results = await Promise.all([
      countVisibleContents(searchQuery, includeUnpublished, categoryId),
      searchQuery
        ? searchVisibleContents(searchQuery, includeUnpublished, sort, order, pageSize, offset, categoryId)
        : listVisibleContents(includeUnpublished, sort, order, pageSize, offset, categoryId),
    ]);
    totalCount = results[0];
    rows = results[1];
  } catch (error) {
    logger.error('[contentService] searchVisibleContentList failed:', error);
    return {
      posts: [] as (VisibleContentRow & { excerpt: string })[],
      pagination: { totalCount: 0, totalPages: 0, currentPage: page, pageSize },
      error: 'データの取得に失敗しました。時間をおいて再度お試しください。',
    };
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    posts: rows.map((row) => ({
      ...row,
      excerpt:
        row.content.length > 140 ? `${row.content.slice(0, 140).trim()}...` : row.content,
    })) as (VisibleContentRow & { excerpt: string })[],
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
    }
  };
}

export async function getHomePageData(): Promise<{
  recentPosts: Awaited<ReturnType<typeof getHomePageContentList>>;
  featuredPost: Awaited<ReturnType<typeof getHomePageContentList>>[number] | null;
  allTimePosts: Awaited<ReturnType<typeof getHomePageContentList>>;
  weeklyPosts: Awaited<ReturnType<typeof getWeeklyPopularContentList>>;
  totalPosts: number;
  error?: string;
}> {
  try {
    const [recentList, totalCount, weeklyPosts] = await Promise.all([
      getHomePageContentList(6),
      countPublishedContents(),
      getWeeklyPopularContentList(6),
    ]);

    return {
      recentPosts: recentList.slice(0, 3),
      featuredPost: recentList.length > 0 ? recentList[0] : null,
      allTimePosts: recentList,
      weeklyPosts,
      totalPosts: totalCount,
    };
  } catch (error) {
    logger.error('[contentService] getHomePageData failed:', error);
    return {
      recentPosts: [],
      featuredPost: null,
      allTimePosts: [],
      weeklyPosts: [],
      totalPosts: 0,
      error: 'データの取得に失敗しました。時間をおいて再度お試しください。',
    };
  }
}

export async function getWeeklyPopularContentList(limitCount = 6) {
  try {
    return await getWeeklyPopularContents(limitCount);
  } catch (error) {
    logger.error('[contentService] getWeeklyPopularContentList failed:', error);
    return [];
  }
}

export async function getAccessibleContentDetail(slug: string, editor: EditorContext | null) {
  const content = editor
    ? await findEditableContentBySlug(slug)
    : await findPublishedContentBySlug(slug);

  if (!content) {
    return null;
  }
  if (!editor) {
    await incrementContentViewCount(content.id);
  }

  return content;
}

export async function getEditableContentDetail(slug: string) {
  const content = await findEditableContentBySlug(slug);

  if (!content) {
    return null;
  }

  const taxonomy = await getContentTaxonomyState(content.id);

  return {
    ...content,
    tagIds: taxonomy.tagIds,
    categoryIds: taxonomy.categoryIds,
  };
}

export type UpdateContentResult =
  | {
    success: true;
    data: {
      id: number;
      slug: string;
      title: string;
      latestRevision: number | null;
    };
  }
  | {
    success: false;
    error: string;
  };

export async function updateContent(
  editor: EditorContext,
  input: UpdateContentInput,
  options?: {
    deviceSessionId?: number | null;
  },
): Promise<UpdateContentResult> {
  const current = await findContentSummaryById(input.contentId);

  if (!current) {
    return {
      success: false,
      error: serviceErrors.content.contentNotFound,
    };
  }

  const existing = await findEditableContentBySlug(input.slug);

  if (existing && existing.id !== input.contentId) {
    return {
      success: false,
      error: serviceErrors.content.slugAlreadyUsed,
    };
  }

  const resolvedTaxonomy = await resolveTaxonomySelection({
    existingTagIds: input.tagIds,
    newTags: input.newTags,
    existingCategoryIds: input.categoryIds,
    newCategoryName: input.newCategoryName,
    newCategoryParentId: input.newCategoryParentId,
  });
  const currentTaxonomy = await getContentTaxonomyState(input.contentId);
  const taxonomyChanges = detectTaxonomyChanges(currentTaxonomy, resolvedTaxonomy);

  const effectiveIsPublished =
    editor.type === 'actor' ? input.isPublished : current.isPublished;

  const updated = await updateContentWithRevision({
    contentId: input.contentId,
    slug: input.slug,
    title: input.title,
    content: input.content,
    thumbnail: input.thumbnail,
    isPublished: effectiveIsPublished,
    userId: editor.type === 'actor' ? editor.actorId : null,
    sessionId: editor.type === 'session' ? editor.sessionId : null,
    deviceSessionId: options?.deviceSessionId ?? null,
    tagIds: resolvedTaxonomy.tagIds,
    categoryIds: resolvedTaxonomy.categoryIds,
    tagChanged: taxonomyChanges.tagChanged,
    categoryChanged: taxonomyChanges.categoryChanged,
  });

  return {
    success: true,
    data: {
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      latestRevision: updated.latestRevision,
    },
  };
}

export { getTaxonomyOptions, countVisibleContents };

type ActorOnlyEditor = Extract<EditorContext, { type: 'actor' }>;

export type DeleteContentResult =
  | {
    success: true;
    data: {
      id: number;
      slug: string;
      title: string;
    };
  }
  | {
    success: false;
    error: string;
  };

export async function deleteContent(
  editor: ActorOnlyEditor,
  input: DeleteContentInput,
): Promise<DeleteContentResult> {
  if (editor.role !== 'owner' && editor.role !== 'admin') {
    return {
      success: false,
      error: commonErrors.content.deletePermissionDenied,
    };
  }

  const deleted = await deleteContentById(input.contentId);

  if (!deleted) {
    return {
      success: false,
      error: serviceErrors.content.contentNotFound,
    };
  }

  return {
    success: true,
    data: deleted,
  };
}
