'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { banAccountSchema } from '@/server/schemas/accountBanSchemas';
import { banAccount, unbanAccount } from '@/server/services/accountBanService';
import { recordAuditLog } from '@/server/services/auditLogService';
import type { BaseActionState } from '@/types/actionState';

export type BanAccountActionState = BaseActionState;

export async function banAccountAction(
  _prevState: BanAccountActionState,
  formData: FormData,
): Promise<BanAccountActionState> {
  const parsed = banAccountSchema.safeParse({
    userId: formData.get('userId'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: 'アカウントBAN権限がありません',
    };
  }

  const result = await banAccount(actor, parsed.data);

  if (!result.success) {
    return {
      error: result.error,
    };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: "ban_account",
    targetType: "user",
    targetId: String(parsed.data.userId),
  });

  revalidatePath('/owner/account-bans');

  return {
    error: null,
  };
}

export async function unbanAccountAction(
  _prevState: BanAccountActionState,
  formData: FormData,
): Promise<BanAccountActionState> {
  const parsed = banAccountSchema.safeParse({
    userId: formData.get('userId'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: 'アカウントBAN解除権限がありません',
    };
  }

  const result = await unbanAccount(actor, parsed.data);

  if (!result.success) {
    return {
      error: result.error,
    };
  }
  await recordAuditLog({
    actorId: actor.id,
    action: "unban_account",
    targetType: "user",
    targetId: String(parsed.data.userId),
  });

  revalidatePath('/owner/account-bans');

  return {
    error: null,
  };
}
