'use server';

import { redirect } from 'next/navigation';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { getFirstZodErrorMessage, getZodFieldErrors } from '@/server/lib/zodError';
import {
  createContentSchema,
  deleteContentSchema,
  normalizeCreateContentInput,
  updateContentSchema,
} from '@/server/schemas/contentSchemas';
import { createContent, deleteContent, updateContent } from '@/server/services/contentService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { recordCurrentEditDeviceSession } from '@/server/services/deviceService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';
import { recordAuditLog } from '@/server/services/auditLogService';
import { withAction, requireActor } from '@/server/lib/withAction';
import type { BaseActionState } from '@/types/actionState';

export type ContentActionState = BaseActionState & {
  slug: string | null;
  title: string | null;
  fieldErrors?: Record<string, string>;
};

export async function createContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const preflight = await withAction({ rateLimit: 'createContent' });
  if (preflight) return { ...preflight, slug: null, title: null };

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
      fieldErrors: getZodFieldErrors(parsed.error),
      slug: null,
      title: null,
    };
  }

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return {
      error: 'このIPアドレスからの項目作成は許可されていません',
      slug: null,
      title: null,
    };
  }

  const normalized = normalizeCreateContentInput(parsed.data);
  const editor = await getCurrentEditor(normalized.session);

  if (!editor) {
    return {
      error: '項目作成権限がありません',
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

  await recordAuditLog({
    actorId: editor.type === "actor" ? editor.actorId : null,
    action: "create_content",
    targetType: "content",
    targetId: String(result.data.id),
    detail: { slug: result.data.slug },
  });

  const destination =
    parsed.data.session && parsed.data.session.length > 0
      ? `/posts/${encodeURIComponent(result.data.slug)}?session=${encodeURIComponent(parsed.data.session)}`
      : `/posts/${encodeURIComponent(result.data.slug)}`;

  redirect(destination);
}

export async function updateContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const preflight = await withAction({ rateLimit: 'updateContent' });
  if (preflight) return { ...preflight, slug: null, title: null };

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
      fieldErrors: getZodFieldErrors(parsed.error),
      slug: null,
      title: null,
    };
  }

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return {
      error: 'このIPアドレスからの項目編集は許可されていません',
      slug: null,
      title: null,
    };
  }

  const editor = await getCurrentEditor(parsed.data.session ?? null);

  if (!editor) {
    return {
      error: '項目編集権限がありません',
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

  await recordAuditLog({
    actorId: editor.type === "actor" ? editor.actorId : null,
    action: "update_content",
    targetType: "content",
    targetId: String(result.data.id),
    detail: { slug: result.data.slug },
  });

  const destination =
    parsed.data.session && parsed.data.session.length > 0
      ? `/posts/${encodeURIComponent(result.data.slug)}?session=${encodeURIComponent(parsed.data.session)}`
      : `/posts/${encodeURIComponent(result.data.slug)}`;

  redirect(destination);
}

export async function deleteContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const preflight = await withAction({ rateLimit: 'deleteContent', device: false });
  if (preflight) return { ...preflight, slug: null, title: null };

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

  const actor = await requireActor();
  if ('error' in actor) {
    return { error: '項目削除権限がありません', slug: null, title: null };
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

  await recordAuditLog({
    actorId: actor.id,
    action: 'delete_content',
    targetType: 'content',
    targetId: String(result.data.id),
    detail: { slug: result.data.slug, title: result.data.title },
  });

  redirect('/posts?deleted=1');
}
