'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';

import { banAccountSchema } from '@/server/schemas';
import {
    commonErrors,
} from '@/server/errors';
import {
    banAccount,
    unbanAccount,
} from '@/server/services/accountBanService';
import { recordAuditLog } from '@/server/services/auditLogService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';

import { withAction } from '@/server/actions/modules/withAction';
import type { BaseActionState } from '@/types/actionState';

export type BanAccountActionState = BaseActionState;

export async function banAccountAction(
  _prevState: BanAccountActionState,
  formData: FormData,
): Promise<BanAccountActionState> {
  try {
    const preflight = await withAction({ rateLimit: 'banAccount', device: false });
    if (preflight) return preflight;

    const activeBan = await getCurrentRequestBan();
    if (activeBan) {
      return { error: commonErrors.ip.accountBanNotAllowed };
    }

    const parsed = banAccountSchema.safeParse({
      userId: formData.get('userId'),
    });

    if (!parsed.success) {
      return { error: getFirstZodErrorMessage(parsed.error) };
    }

    const actor = await getCurrentActor();

    if (!actor) {
      return { error: commonErrors.accountBan.banPermissionDenied };
    }

    const result = await banAccount(actor, parsed.data);

    if (!result.success) {
      return { error: result.error };
    }

    await recordAuditLog({
      actorId: actor.id,
      action: "ban_account",
      targetType: "user",
      targetId: String(parsed.data.userId),
    });

    revalidatePath('/owner/account-bans');
    redirect('/owner/account-bans');
  } catch (e) {
    console.error('banAccountAction failed', e);
    return { error: '予期しないエラーが発生しました。' };
  }
}

export async function unbanAccountAction(
  _prevState: BanAccountActionState,
  formData: FormData,
): Promise<BanAccountActionState> {
  try {
    const preflight = await withAction({ rateLimit: 'banAccount', device: false });
    if (preflight) return preflight;

    const parsed = banAccountSchema.safeParse({
      userId: formData.get('userId'),
    });

    if (!parsed.success) {
      return { error: getFirstZodErrorMessage(parsed.error) };
    }

    const actor = await getCurrentActor();

    if (!actor) {
      return { error: commonErrors.accountBan.unbanPermissionDenied };
    }

    const result = await unbanAccount(actor, parsed.data);

    if (!result.success) {
      return { error: result.error };
    }

    await recordAuditLog({
      actorId: actor.id,
      action: "unban_account",
      targetType: "user",
      targetId: String(parsed.data.userId),
    });

    revalidatePath('/owner/account-bans');
    redirect('/owner/account-bans');
  } catch (e) {
    console.error('unbanAccountAction failed', e);
    return { error: '予期しないエラーが発生しました。' };
  }
}
