import type { CreateContentInput } from '@/server/schemas/contentSchemas';
import {
  createContentWithInitialRevision,
  deleteContentById,
  findContentSummaryById,
  findPublishedContentBySlug,
  findEditableContentBySlug,
  findContentBySlug,
  incrementContentViewCount,
  listVisibleContents,
  listPublishedContents,
  searchVisibleContents,
  searchPublishedContents,
  updateContentWithRevision,
  countVisibleContents,
  getWeeklyPopularContents,
} from '@/server/repositories/contentRepository';
import type { ContentSortKey, SortOrder } from '@/server/repositories/contentRepository';
import type { EditorContext } from '@/server/lib/currentEditor';
import type { DeleteContentInput, UpdateContentInput } from '@/server/schemas/contentSchemas';
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
      error: 'スラッグを生成できませんでした',
    };
  }

  const existing = await findContentBySlug(input.slug);

  if (existing) {
    return {
      success: false,
      error: 'そのスラッグはすでに使われています',
    };
  }

  const resolvedTaxonomy = await resolveTaxonomySelection({
    existingTagIds: input.tagIds,
    newTags: input.newTags,
    existingCategoryIds: input.categoryIds,
    newCategoryName: input.newCategoryName,
    newCategoryParentId: input.newCategoryParentId,
  });

  const effectiveIsPublished = editor.type === 'actor' ? input.isPublished : false;

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

export async function getPublishedContentList(sort?: ContentSortKey, order?: SortOrder) {
  const rows = await listPublishedContents(sort, order);

  return rows.map((row) => ({
    ...row,
    excerpt:
      row.content.length > 140 ? `${row.content.slice(0, 140).trim()}...` : row.content,
  }));
}

export async function searchPublishedContentList(query: string, sort?: ContentSortKey, order?: SortOrder) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return getPublishedContentList(sort, order);
  }

  const rows = await searchPublishedContents(trimmedQuery, sort, order);

  return rows.map((row) => ({
    ...row,
    excerpt:
      row.content.length > 140 ? `${row.content.slice(0, 140).trim()}...` : row.content,
  }));
}

export async function searchVisibleContentList(
  query: string, 
  includeUnpublished: boolean,
  sort?: ContentSortKey,
  order?: SortOrder,
  page: number = 1,
  pageSize: number = 10,
  categoryId?: number
) {
  const trimmedQuery = query.trim();
  const offset = (page - 1) * pageSize;

  const searchQuery = trimmedQuery || undefined;

  const [totalCount, rows] = await Promise.all([
    countVisibleContents(searchQuery, includeUnpublished, categoryId),
    searchQuery
      ? await searchVisibleContents(searchQuery, includeUnpublished, sort, order, pageSize, offset, categoryId)
      : await listVisibleContents(includeUnpublished, sort, order, pageSize, offset, categoryId),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    posts: rows.map((row) => ({
      ...row,
      excerpt:
        row.content.length > 140 ? `${row.content.slice(0, 140).trim()}...` : row.content,
    })),
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
    }
  };
}

export async function getWeeklyPopularContentList(limitCount = 6) {
  return await getWeeklyPopularContents(limitCount);
}

export async function getPublishedContentDetail(slug: string) {
  const content = await findPublishedContentBySlug(slug);

  if (!content) {
    return null;
  }

  const updated = await incrementContentViewCount(content.id);

  return {
    ...content,
    viewCount: updated?.viewCount ?? content.viewCount,
  };
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
      error: '対象の記事が見つかりません',
    };
  }

  const existing = await findEditableContentBySlug(input.slug);

  if (existing && existing.id !== input.contentId) {
    return {
      success: false,
      error: 'そのスラッグはすでに使われています',
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
      error: '記事削除権限がありません',
    };
  }

  const deleted = await deleteContentById(input.contentId);

  if (!deleted) {
    return {
      success: false,
      error: '対象の記事が見つかりません',
    };
  }

  return {
    success: true,
    data: deleted,
  };
}
