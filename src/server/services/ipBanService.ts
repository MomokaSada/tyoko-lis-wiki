import type { CreateIpBanInput, CreateDeviceBanInput } from '@/server/schemas';
import { getCurrentRequestDevice } from '@/server/services/modules/requestDevice';
import {
    createDevice,
    findDeviceByIp,
    findDeviceById,
} from '@/server/repositories/deviceRepository';
import {
    createBlockDevice,
    deactivateBlockDeviceById,
    findActiveBlockByDeviceId,
    findActiveBlockByIp,
    listActiveIpBans,
    listActiveIpBansPaginated,
    listIpDeviceRecords,
    listIpDeviceRecordsPaginated,
} from '@/server/repositories/ipBanRepository';

import type { PrivilegedActor as Actor } from '@/types/actor';
import type { ListQuery, ListResult } from '@/types/listQuery';
import { logger } from '@/server/lib/logger';
import {
    commonErrors,
    serviceErrors,
} from '@/server/errors';

export async function createIpBan(actor: Actor, input: CreateIpBanInput) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: commonErrors.ipBan.createPermissionDenied,
    };
  }

  const device = (await findDeviceByIp(input.ip)) ?? (await createDevice({
    ip: input.ip,
    browser: input.browser,
  }));

  const existingBan = await findActiveBlockByIp(input.ip);

  if (existingBan) {
    return {
      success: false as const,
      error: serviceErrors.ipBan.alreadyBanned,
    };
  }

  await createBlockDevice({
    deviceId: device.id,
    blockedBy: actor.id,
    reason: input.reason,
  });

  return {
    success: true as const,
    data: {
      ip: input.ip,
      reason: input.reason,
    },
  };
}

/**
 * アクセス記録の deviceId を指定して BAN する。
 * IP 手入力が不要なため誤BANを防止できる。
 */
export async function createDeviceBan(actor: Actor, input: CreateDeviceBanInput) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: commonErrors.ipBan.createPermissionDenied,
    };
  }

  const device = await findDeviceById(input.deviceId);

  if (!device) {
    return {
      success: false as const,
      error: serviceErrors.ipBan.deviceNotFound,
    };
  }

  const existingBan = await findActiveBlockByDeviceId(input.deviceId);

  if (existingBan) {
    return {
      success: false as const,
      error: serviceErrors.ipBan.alreadyBanned,
    };
  }

  await createBlockDevice({
    deviceId: device.id,
    blockedBy: actor.id,
    reason: input.reason,
  });

  return {
    success: true as const,
    data: {
      ip: device.ip,
      reason: input.reason,
    },
  };
}

export async function getActiveIpBans(
  actor: Actor,
  query?: ListQuery<'createdAt'>,
): Promise<ListResult<Awaited<ReturnType<typeof listActiveIpBans>>['items'][number]>> {
  if (actor.role !== 'owner') {
    return { items: [], totalCount: 0 };
  }

  if (query) {
    return listActiveIpBansPaginated(query);
  }
  return listActiveIpBans();
}

export async function getIpDeviceRecords(
  actor: Actor,
  query?: ListQuery<'lastSeenAt'>,
): Promise<ListResult<Awaited<ReturnType<typeof listIpDeviceRecords>>['items'][number]>> {
  if (actor.role !== 'owner') {
    return { items: [], totalCount: 0 };
  }

  if (query) {
    return listIpDeviceRecordsPaginated(query);
  }
  return listIpDeviceRecords();
}

export async function deactivateIpBan(actor: Actor, banId: number) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: commonErrors.ipBan.deactivatePermissionDenied,
    };
  }

  const updated = await deactivateBlockDeviceById(banId);

  if (!updated) {
    return {
      success: false as const,
      error: serviceErrors.ipBan.banNotFound,
    };
  }

  return {
    success: true as const,
    data: updated,
  };
}

/**
 * 指定されたIPが現在 BAN されているかを判定する。
 * Server Component のゲートから使用することを想定。
 */
export async function isIpBanned(ip: string): Promise<boolean> {
  try {
    const ban = await findActiveBlockByIp(ip);
    return ban !== null;
  } catch (error) {
    logger.error('[ipBanService] isIpBanned エラー:', error);
    // エラー時は false を返す（fail-closed にするかは呼び出し元に委ねる）
    return false;
  }
}

export async function getCurrentRequestBan() {
  const device = await getCurrentRequestDevice();

  if (!device) {
    return null;
  }

  const ban = await findActiveBlockByIp(device.ip);

  if (!ban) {
    return null;
  }

  return {
    ...ban,
    ip: device.ip,
  };
}
