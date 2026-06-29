'use server';

import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';

import { createEditLinkSchema, deactivateEditLinkSchema } from '@/server/schemas';
import { commonErrors } from '@/server/errors';
import { recordAuditLog } from '@/server/services/auditLogService';
import {
    createEditLink,
    deactivateEditLink,
} from '@/server/services/editLinkService';

import { withAction } from '@/server/actions/modules/withAction';
import type { BaseActionState } from '@/types/actionState';

import { revalidatePath } from 'next/cache';

export type CreateEditLinkActionState = BaseActionState & {
  generatedUrl: string | null;
  expiresAt: string | null;
  maxEdits: number | null;
};

type DeactivateEditLinkActionState = BaseActionState;

export async function createEditLinkAction(
  _prevState: CreateEditLinkActionState,
  formData: FormData,
): Promise<CreateEditLinkActionState> {
  const preflight = await withAction({ rateLimit: 'createEditLink' });
  if (preflight) return { ...preflight, generatedUrl: null, expiresAt: null, maxEdits: null };

  const parsed = createEditLinkSchema.safeParse({
    expiresInMinutes: formData.get('expiresInMinutes'),
    maxEdits: formData.get('maxEdits'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      generatedUrl: null,
      expiresAt: null,
      maxEdits: null,
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: commonErrors.editLink.createPermissionDenied,
      generatedUrl: null,
      expiresAt: null,
      maxEdits: null,
    };
  }

  const result = await createEditLink(actor, parsed.data);

  if (!result.success) {
    return {
      error: result.error,
      generatedUrl: null,
      expiresAt: null,
      maxEdits: null,
    };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: "create_edit_link",
    targetType: "edit_link",
    detail: { expiresAt: result.data.endAt.toISOString() },
  });

  return {
    error: null,
    generatedUrl: result.data.url,
    expiresAt: result.data.endAt.toISOString(),
    maxEdits: result.data.maxEdits,
  };
}

export async function deactivateEditLinkAction(
  _prevState: DeactivateEditLinkActionState,
  formData: FormData,
): Promise<DeactivateEditLinkActionState> {
  const preflight = await withAction({ rateLimit: 'deactivateEditLink' });
  if (preflight) return preflight;

  const parsed = deactivateEditLinkSchema.safeParse({
    uuid: formData.get('uuid'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: commonErrors.permissionDenied,
    };
  }

  const result = await deactivateEditLink(actor, parsed.data.uuid);

  if (!result.success) {
    return {
      error: result.error,
    };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: "deactivate_edit_link",
    targetType: "edit_link",
    targetId: parsed.data.uuid,
  });

  revalidatePath('/admin/edit-links');

  return { error: null };
}
