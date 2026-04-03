'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { createIpBanSchema, deactivateIpBanSchema } from '@/server/schemas/ipBanSchemas';
import { createIpBan, deactivateIpBan } from '@/server/services/ipBanService';
import type { BaseActionState } from '@/server/types/actionState';

export type CreateIpBanActionState = BaseActionState & {
  bannedIp: string | null;
  reason: string | null;
};

export type DeactivateIpBanActionState = {
  error: string | null;
};

export async function createIpBanAction(
  _prevState: CreateIpBanActionState,
  formData: FormData,
): Promise<CreateIpBanActionState> {
  const parsed = createIpBanSchema.safeParse({
    ip: formData.get('ip'),
    browser: formData.get('browser'),
    reason: formData.get('reason'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      bannedIp: null,
      reason: null,
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: 'IPBAN 権限がありません',
      bannedIp: null,
      reason: null,
    };
  }

  const result = await createIpBan(actor, parsed.data);

  if (!result.success) {
    return {
      error: result.error,
      bannedIp: null,
      reason: null,
    };
  }

  return {
    error: null,
    bannedIp: result.data.ip,
    reason: result.data.reason,
  };
}

export async function deactivateIpBanAction(
  _prevState: DeactivateIpBanActionState,
  formData: FormData,
): Promise<DeactivateIpBanActionState> {
  const parsed = deactivateIpBanSchema.safeParse({
    banId: formData.get('banId'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: 'IPBAN 解除権限がありません',
    };
  }

  const result = await deactivateIpBan(actor, parsed.data.banId);

  if (!result.success) {
    return {
      error: result.error,
    };
  }

  revalidatePath('/owner/ip-bans');

  return {
    error: null,
  };
}
