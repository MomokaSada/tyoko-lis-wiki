'use server';

import { getCurrentEditor } from '@/server/lib/currentEditor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import {
  createContentSchema,
  normalizeCreateContentInput,
  updateContentSchema,
} from '@/server/schemas/contentSchemas';
import { createContent, updateContent } from '@/server/services/contentService';

export type CreateContentActionState = {
  error: string | null;
  createdSlug: string | null;
  createdTitle: string | null;
};

export async function createContentAction(
  _prevState: CreateContentActionState,
  formData: FormData,
): Promise<CreateContentActionState> {
  const parsed = createContentSchema.safeParse({
    session: formData.get('session'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    content: formData.get('content'),
    thumbnail: formData.get('thumbnail'),
    isPublished: formData.get('isPublished') === 'on',
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      createdSlug: null,
      createdTitle: null,
    };
  }

  const normalized = normalizeCreateContentInput(parsed.data);
  const editor = await getCurrentEditor(normalized.session);

  if (!editor) {
    return {
      error: '記事作成権限がありません',
      createdSlug: null,
      createdTitle: null,
    };
  }

  const result = await createContent(editor, normalized);

  if (!result.success) {
    return {
      error: result.error,
      createdSlug: null,
      createdTitle: null,
    };
  }

  return {
    error: null,
    createdSlug: result.data.slug,
    createdTitle: result.data.title,
  };
}

export type UpdateContentActionState = {
  error: string | null;
  updatedSlug: string | null;
  updatedTitle: string | null;
};

export async function updateContentAction(
  _prevState: UpdateContentActionState,
  formData: FormData,
): Promise<UpdateContentActionState> {
  const parsed = updateContentSchema.safeParse({
    session: formData.get('session'),
    contentId: formData.get('contentId'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    content: formData.get('content'),
    thumbnail: formData.get('thumbnail'),
    isPublished: formData.get('isPublished') === 'on',
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      updatedSlug: null,
      updatedTitle: null,
    };
  }

  const editor = await getCurrentEditor(parsed.data.session ?? null);

  if (!editor) {
    return {
      error: '記事編集権限がありません',
      updatedSlug: null,
      updatedTitle: null,
    };
  }

  const result = await updateContent(editor, parsed.data);

  if (!result.success) {
    return {
      error: result.error,
      updatedSlug: null,
      updatedTitle: null,
    };
  }

  return {
    error: null,
    updatedSlug: result.data.slug,
    updatedTitle: result.data.title,
  };
}
