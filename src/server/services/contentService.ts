import type { CreateContentInput } from '@/server/schemas/contentSchemas';
import {
  createContentWithInitialRevision,
  findPublishedContentBySlug,
  findContentBySlug,
  listPublishedContents,
  searchPublishedContents,
} from '@/server/repositories/contentRepository';
import type { EditorContext } from '@/server/lib/currentEditor';

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
  return findPublishedContentBySlug(slug);
}
