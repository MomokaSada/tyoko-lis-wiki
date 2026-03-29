import type { CreateIpBanInput } from '@/server/schemas/ipBanSchemas';
import {
  createBlockDevice,
  createDevice,
  findActiveBlockByDeviceId,
  findDeviceByIp,
  listActiveIpBans,
} from '@/server/repositories/ipBanRepository';

type Actor = {
  id: number;
  role: 'owner' | 'admin' | 'bot';
};

export async function createIpBan(actor: Actor, input: CreateIpBanInput) {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return {
      success: false as const,
      error: 'IPBAN 権限がありません',
    };
  }

  const device = (await findDeviceByIp(input.ip)) ?? (await createDevice({
    ip: input.ip,
    browser: input.browser,
  }));

  const existingBan = await findActiveBlockByDeviceId(device.id);

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
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return [];
  }

  return listActiveIpBans();
}
