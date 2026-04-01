'use server';

import { redirect } from 'next/navigation';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import {
  createContentSchema,
  deleteContentSchema,
  normalizeCreateContentInput,
  updateContentSchema,
} from '@/server/schemas/contentSchemas';
import { createContent, deleteContent, updateContent } from '@/server/services/contentService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { recordCurrentRequestDevice } from '@/server/services/deviceService';

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
    tagIds: formData.getAll('tagIds'),
    newTags: formData.get('newTags'),
    categoryIds: formData.getAll('categoryIds'),
    newCategoryName: formData.get('newCategoryName'),
    newCategoryParentId: formData.get('newCategoryParentId'),
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

  await recordCurrentRequestDevice();

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
    thumbnail: formData.get('removeThumbnail') === 'on' ? null : formData.get('thumbnail'),
    isPublished: formData.get('isPublished') === 'on',
    tagIds: formData.getAll('tagIds'),
    newTags: formData.get('newTags'),
    categoryIds: formData.getAll('categoryIds'),
    newCategoryName: formData.get('newCategoryName'),
    newCategoryParentId: formData.get('newCategoryParentId'),
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

  await recordCurrentRequestDevice();

  const destination =
    parsed.data.session && parsed.data.session.length > 0
      ? `/posts/${result.data.slug}?session=${encodeURIComponent(parsed.data.session)}`
      : `/posts/${result.data.slug}`;

  redirect(destination);
}

export type DeleteContentActionState = {
  error: string | null;
  deletedSlug: string | null;
  deletedTitle: string | null;
};

export async function deleteContentAction(
  _prevState: DeleteContentActionState,
  formData: FormData,
): Promise<DeleteContentActionState> {
  const parsed = deleteContentSchema.safeParse({
    contentId: formData.get('contentId'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      deletedSlug: null,
      deletedTitle: null,
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: '記事削除権限がありません',
      deletedSlug: null,
      deletedTitle: null,
    };
  }

  const result = await deleteContent(
    {
      type: 'actor',
      actorId: actor.id,
      role: actor.role,
    },
    parsed.data,
  );

  if (!result.success) {
    return {
      error: result.error,
      deletedSlug: null,
      deletedTitle: null,
    };
  }

  return {
    error: null,
    deletedSlug: result.data.slug,
    deletedTitle: result.data.title,
  };
}
