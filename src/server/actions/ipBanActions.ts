'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { createIpBanSchema, deactivateIpBanSchema } from '@/server/schemas/ipBanSchemas';
import { createIpBan, deactivateIpBan } from '@/server/services/ipBanService';
import type { BaseActionState } from '@/server/types/actionState';
import { checkRateLimit } from '@/server/services/rateLimitService';
import { recordCurrentRequestDevice } from '@/server/services/deviceService';
import { recordAuditLog } from "@/server/services/auditLogService";


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
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('createIpBan');
  if (!rateLimitResult.allowed) {
    return {
      error: 'IPBAN作成試行が多すぎます。しばらくしてから再度お試しください。',
      bannedIp: null,
      reason: null,
    };
  }

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

  await recordAuditLog({
    actorId: actor.id,
    action: "create_ip_ban",
    targetType: "ip_ban",
    detail: { ip: result.data.ip, reason: result.data.reason },
  });

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

  await recordAuditLog({
    actorId: actor.id,
    action: "deactivate_ip_ban",
    targetType: "ip_ban",
    targetId: String(parsed.data.banId),
  });

  revalidatePath('/owner/ip-bans');

  return {
    error: null,
  };
}
