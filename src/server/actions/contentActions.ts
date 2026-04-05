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
import { recordCurrentEditDeviceSession, recordCurrentRequestDevice } from '@/server/services/deviceService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';
import { BaseActionState } from '@/server/types/actionState';
import { checkRateLimit } from '@/server/services/rateLimitService';

export type ContentActionState = BaseActionState & {
  slug: string | null;
  title: string | null;
};

export async function createContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('createContent');
  if (!rateLimitResult.allowed) {
    return {
      error: '記事作成試行が多すぎます。しばらくしてから再度お試しください。',
      slug: null,
      title: null,
    };
  }

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
      slug: null,
      title: null,
    };
  }

  const activeBan = await getCurrentRequestBan();

  if (activeBan) {
    return {
      error: 'このIPアドレスからの記事作成は許可されていません',
      slug: null,
      title: null,
    };
  }

  const normalized = normalizeCreateContentInput(parsed.data);
  const editor = await getCurrentEditor(normalized.session);

  if (!editor) {
    return {
      error: '記事作成権限がありません',
      slug: null,
      title: null,
    };
  }

  const deviceSessionId =
    editor.type === 'session'
      ? await recordCurrentEditDeviceSession(editor.sessionId)
      : null;

  const result = await createContent(editor, normalized, { deviceSessionId });

  if (!result.success) {
    return {
      error: result.error,
      slug: null,
      title: null,
    };
  }

  await recordCurrentRequestDevice();

  const destination =
    parsed.data.session && parsed.data.session.length > 0
      ? `/posts/${result.data.slug}?session=${encodeURIComponent(parsed.data.session)}`
      : `/posts/${result.data.slug}`;

  redirect(destination);
}

export async function updateContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('updateContent');
  if (!rateLimitResult.allowed) {
    return {
      error: '記事編集試行が多すぎます。しばらくしてから再度お試しください。',
      slug: null,
      title: null,
    };
  }
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
      slug: null,
      title: null,
    };
  }

  const activeBan = await getCurrentRequestBan();

  if (activeBan) {
    return {
      error: 'このIPアドレスからの記事編集は許可されていません',
      slug: null,
      title: null,
    };
  }

  const editor = await getCurrentEditor(parsed.data.session ?? null);

  if (!editor) {
    return {
      error: '記事編集権限がありません',
      slug: null,
      title: null,
    };
  }

  const deviceSessionId =
    editor.type === 'session'
      ? await recordCurrentEditDeviceSession(editor.sessionId)
      : null;

  const result = await updateContent(editor, parsed.data, { deviceSessionId });

  if (!result.success) {
    return {
      error: result.error,
      slug: null,
      title: null,
    };
  }

  await recordCurrentRequestDevice();

  const destination =
    parsed.data.session && parsed.data.session.length > 0
      ? `/posts/${result.data.slug}?session=${encodeURIComponent(parsed.data.session)}`
      : `/posts/${result.data.slug}`;

  redirect(destination);
}

export async function deleteContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const rateLimitResult = await checkRateLimit('deleteContent');
  if (!rateLimitResult.allowed) {
    return {
      error: '記事削除試行が多すぎます。しばらくしてから再度お試しください。',
      slug: null,
      title: null,
    };
  }
  const parsed = deleteContentSchema.safeParse({
    contentId: formData.get('contentId'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      slug: null,
      title: null,
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: '記事削除権限がありません',
      slug: null,
      title: null,
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
      slug: null,
      title: null,
    };
  }

  return {
    error: null,
    slug: result.data.slug,
    title: result.data.title,
  };
}
