import type { CreateIpBanInput } from '@/server/schemas/ipBanSchemas';
import { getCurrentRequestDevice } from '@/server/lib/requestDevice';
import {
  createBlockDevice,
  createDevice,
  deactivateBlockDeviceById,
  findActiveBlockByIp,
  findDeviceByIp,
  listActiveIpBans,
  listActiveIpBansPaginated,
  listIpDeviceRecords,
  listIpDeviceRecordsPaginated,
} from '@/server/repositories/ipBanRepository';
import type { PrivilegedActor as Actor } from '@/types/actor';
import type { ListQuery, ListResult } from '@/types/listQuery';

export async function createIpBan(actor: Actor, input: CreateIpBanInput) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: 'IPBAN 権限がありません',
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
      error: 'そのIPはすでにBANされています',
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
      error: 'IPBAN 解除権限がありません',
    };
  }

  const updated = await deactivateBlockDeviceById(banId);

  if (!updated) {
    return {
      success: false as const,
      error: '対象のIPBANが見つかりません',
    };
  }

  return {
    success: true as const,
    data: updated,
  };
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
