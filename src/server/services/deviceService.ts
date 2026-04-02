import { getCurrentRequestDevice } from '@/server/lib/requestDevice';
import {
  createDeviceSessionRecord,
  createDeviceRecord,
  findDeviceSessionRecord,
  findDeviceByIpAndBrowser,
  listDeviceSessionUsageRecords,
  touchDeviceSessionRecord,
  touchDeviceRecord,
} from '@/server/repositories/deviceRepository';

type Actor = {
  id: number;
  role: 'owner' | 'admin' | 'bot';
};

export async function recordCurrentRequestDevice() {
  const device = await getCurrentRequestDevice();

  if (!device) {
    return null;
  }

  const existing = await findDeviceByIpAndBrowser(device.ip, device.browser);

  if (existing) {
    await touchDeviceRecord(existing.id);
    return existing;
  }

  return createDeviceRecord(device);
}

export async function recordCurrentEditDeviceSession(sessionId: string) {
  const device = await recordCurrentRequestDevice();

  if (!device) {
    return null;
  }

  const existing = await findDeviceSessionRecord(device.id, sessionId);

  if (existing) {
    await touchDeviceSessionRecord(existing.id);
    return existing.id;
  }

  const created = await createDeviceSessionRecord({
    deviceId: device.id,
    sessionId,
  });

  return created.id;
}

export async function getDeviceSessionUsageRecords(actor: Actor) {
  if (actor.role !== 'owner') {
    return [];
  }

  return listDeviceSessionUsageRecords();
}
