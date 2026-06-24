'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';

import { createIpBanSchema, createDeviceBanSchema, deactivateIpBanSchema } from '@/server/schemas';
import { commonErrors } from '@/server/errors';
import {
    createIpBan,
    createDeviceBan,
    deactivateIpBan,
    getCurrentRequestBan,
} from '@/server/services/ipBanService';
import { withAction } from '@/server/actions/modules/withAction';
import type { BaseActionState } from '@/types/actionState';
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
  const preflight = await withAction({ rateLimit: 'createIpBan' });
  if (preflight) return { ...preflight, bannedIp: null, reason: null };

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: commonErrors.ipBan.actionBlockedByBan, bannedIp: null, reason: null };
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
      error: commonErrors.ipBan.createPermissionDenied,
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

export type BanDeviceFromRecordActionState = BaseActionState & {
  bannedIp: string | null;
  reason: string | null;
};

/**
 * アクセス記録の deviceId から BAN する（IP 手入力不要、誤BAN防止）。
 */
export async function createDeviceBanAction(
  _prevState: BanDeviceFromRecordActionState,
  formData: FormData,
): Promise<BanDeviceFromRecordActionState> {
  const preflight = await withAction({ rateLimit: 'createIpBan' });
  if (preflight) return { ...preflight, bannedIp: null, reason: null };

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: commonErrors.ipBan.actionBlockedByBan, bannedIp: null, reason: null };
  }

  const parsed = createDeviceBanSchema.safeParse({
    deviceId: formData.get('deviceId'),
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
      error: commonErrors.ipBan.createPermissionDenied,
      bannedIp: null,
      reason: null,
    };
  }

  const result = await createDeviceBan(actor, parsed.data);

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

  revalidatePath('/owner/ip-bans');

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
  const preflight = await withAction({ device: false });
  if (preflight) return preflight;

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: commonErrors.ipBan.actionBlockedByBan };
  }

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
      error: commonErrors.ipBan.deactivatePermissionDenied,
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
