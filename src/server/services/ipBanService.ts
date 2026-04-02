import type { CreateIpBanInput } from '@/server/schemas/ipBanSchemas';
import { getCurrentRequestDevice } from '@/server/lib/requestDevice';
import {
  createBlockDevice,
  createDevice,
  deactivateBlockDeviceById,
  findActiveBlockByIp,
  findDeviceByIp,
  listActiveIpBans,
  listIpDeviceRecords,
} from '@/server/repositories/ipBanRepository';

type Actor = {
  id: number;
  role: 'owner' | 'admin' | 'bot';
};

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

export async function getActiveIpBans(actor: Actor) {
  if (actor.role !== 'owner') {
    return [];
  }

  return listActiveIpBans();
}

export async function getIpDeviceRecords(actor: Actor) {
  if (actor.role !== 'owner') {
    return [];
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
