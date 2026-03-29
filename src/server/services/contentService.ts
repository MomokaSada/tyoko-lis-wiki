import type { CreateContentInput } from '@/server/schemas/contentSchemas';
import {
  createContentWithInitialRevision,
  deleteContentById,
  findPublishedContentBySlug,
  findEditableContentBySlug,
  findContentBySlug,
  incrementContentViewCount,
  listPublishedContents,
  searchPublishedContents,
  updateContentWithRevision,
} from '@/server/repositories/contentRepository';
import type { EditorContext } from '@/server/lib/currentEditor';
import type { DeleteContentInput, UpdateContentInput } from '@/server/schemas/contentSchemas';

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

  const created = await createContentWithInitialRevision({
    slug: input.slug,
    title: input.title,
    content: input.content,
    thumbnail: input.thumbnail,
    isPublished: input.isPublished,
    userId: editor.type === 'actor' ? editor.actorId : null,
    sessionId: editor.type === 'session' ? editor.sessionId : null,
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

export async function getPublishedContentList() {
  const rows = await listPublishedContents();

  return rows.map((row) => ({
    ...row,
    excerpt:
      row.content.length > 140 ? `${row.content.slice(0, 140).trim()}...` : row.content,
  }));
}

export async function searchPublishedContentList(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return getPublishedContentList();
  }

  const rows = await searchPublishedContents(trimmedQuery);

  return rows.map((row) => ({
    ...row,
    excerpt:
      row.content.length > 140 ? `${row.content.slice(0, 140).trim()}...` : row.content,
  }));
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

export async function getEditableContentDetail(slug: string) {
  return findEditableContentBySlug(slug);
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
): Promise<UpdateContentResult> {
  const existing = await findEditableContentBySlug(input.slug);

  if (existing && existing.id !== input.contentId) {
    return {
      success: false,
      error: 'そのスラッグはすでに使われています',
    };
  }

  const updated = await updateContentWithRevision({
    contentId: input.contentId,
    slug: input.slug,
    title: input.title,
    content: input.content,
    thumbnail: input.thumbnail,
    isPublished: input.isPublished,
    userId: editor.type === 'actor' ? editor.actorId : null,
    sessionId: editor.type === 'session' ? editor.sessionId : null,
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
