'use server';

import { redirect } from 'next/navigation';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import {
    getFirstZodErrorMessage,
    getZodFieldErrors,
} from '@/server/lib/zodError';

import { z } from 'zod';
import {
    createContentSchema,
    deleteContentSchema,
    normalizeCreateContentInput,
    updateContentSchema,
} from '@/server/schemas';
import { commonErrors } from '@/server/errors';
import { recordAuditLog } from '@/server/services/auditLogService';
import {
    createContent,
    deleteContent,
    updateContent,
} from '@/server/services/contentService';
import { recordCurrentEditDeviceSession } from '@/server/services/deviceService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';

import {
    withAction,
    requireActor,
} from '@/server/actions/modules/withAction';
import type { BaseActionState } from '@/types/actionState';

export type ContentActionState = BaseActionState & {
  slug: string | null;
  title: string | null;
  fieldErrors?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// 内部ヘルパー: createContentAction / updateContentAction の
// 前処理（withAction → Zod パース → BAN チェック → Editor 解決 →
// デバイスセッション記録）を共通化する
// ---------------------------------------------------------------------------

type PreprocessContentResult<T> =
  | { success: true; parsed: T; editor: NonNullable<Awaited<ReturnType<typeof getCurrentEditor>>>; deviceSessionId: number | null }
  | { success: false; state: ContentActionState };

/** preprocessContentAction が内部でアクセスするプロパティ */
interface ContentParsedBase {
  session?: string | null;
}

async function preprocessContentAction<T extends ContentParsedBase>(
  formData: FormData,
  schema: z.ZodType<T>,
  options: {
    rateLimit: 'createContent' | 'updateContent';
    banError: string;
    requireSession: boolean;
  },
): Promise<PreprocessContentResult<T>> {
  // 1. withAction によるレート制限・デバイス記録
  const preflight = await withAction({ rateLimit: options.rateLimit });
  if (preflight) return { success: false, state: { ...preflight, slug: null, title: null } };

  // 2. Zod パース
  const parsed = schema.safeParse({
    session: formData.get('session'),
    contentId: formData.get('contentId'),
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
      success: false,
      state: {
        error: getFirstZodErrorMessage(parsed.error),
        fieldErrors: getZodFieldErrors(parsed.error),
        slug: null,
        title: null,
      },
    };
  }

  // 3. IP BAN チェック
  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { success: false, state: { error: options.banError, slug: null, title: null } };
  }

  // 4. Editor 解決
  const sessionValue = parsed.data.session ?? null;
  const editor = await getCurrentEditor(options.requireSession ? sessionValue : null);

  if (!editor) {
    return { success: false, state: { error: commonErrors.content.createPermissionDenied, slug: null, title: null } };
  }

  // 5. デバイスセッション記録
  const deviceSessionId =
    editor.type === 'session'
      ? await recordCurrentEditDeviceSession(editor.sessionId)
      : null;

  return { success: true, parsed: parsed.data, editor, deviceSessionId };
}

export async function createContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const preprocessed = await preprocessContentAction(formData, createContentSchema, {
    rateLimit: 'createContent',
    banError: commonErrors.ip.contentCreateNotAllowed,
    requireSession: true,
  });
  if (!preprocessed.success) return preprocessed.state;

  const { editor, deviceSessionId } = preprocessed;
  const normalized = normalizeCreateContentInput(preprocessed.parsed);

  // セッションは normalize 済みの値を使う
  const result = await createContent(editor, normalized, { deviceSessionId });

  if (!result.success) {
    return { error: result.error, slug: null, title: null };
  }

  await recordAuditLog({
    actorId: editor.type === "actor" ? editor.actorId : null,
    action: "create_content",
    targetType: "content",
    targetId: String(result.data.id),
    detail: { slug: result.data.slug },
  });

  const destination =
    normalized.session && normalized.session.length > 0
      ? `/posts/${encodeURIComponent(result.data.slug)}?session=${encodeURIComponent(normalized.session)}`
      : `/posts/${encodeURIComponent(result.data.slug)}`;

  redirect(destination);
}

export async function updateContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const preprocessed = await preprocessContentAction(formData, updateContentSchema, {
    rateLimit: 'updateContent',
    banError: commonErrors.ip.contentEditNotAllowed,
    requireSession: false,
  });
  if (!preprocessed.success) return preprocessed.state;

  const { editor, deviceSessionId, parsed } = preprocessed;

  const result = await updateContent(editor, parsed, { deviceSessionId });

  if (!result.success) {
    return { error: result.error, slug: null, title: null };
  }

  await recordAuditLog({
    actorId: editor.type === "actor" ? editor.actorId : null,
    action: "update_content",
    targetType: "content",
    targetId: String(result.data.id),
    detail: { slug: result.data.slug },
  });

  const destination =
    parsed.session && parsed.session.length > 0
      ? `/posts/${encodeURIComponent(result.data.slug)}?session=${encodeURIComponent(parsed.session)}`
      : `/posts/${encodeURIComponent(result.data.slug)}`;

  redirect(destination);
}

export async function deleteContentAction(
  _prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const preflight = await withAction({ rateLimit: 'deleteContent', device: false });
  if (preflight) return { ...preflight, slug: null, title: null };

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: commonErrors.ip.contentDeleteNotAllowed, slug: null, title: null };
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

  const actor = await requireActor();
  if ('error' in actor) {
    return { error: commonErrors.content.deletePermissionDenied, slug: null, title: null };
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
