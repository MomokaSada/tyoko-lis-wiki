import { getCurrentRequestDevice } from '@/server/lib/requestDevice';
import {
  createDeviceSessionRecord,
  createDeviceRecord,
  findDeviceSessionRecord,
  findDeviceByIpAndBrowser,
  getDeviceSessionUsageRecord,
  getDeviceSessionEditLogs,
  listDeviceSessionUsageRecords,
  listDeviceSessionUsageRecordsPaginated,
  touchDeviceSessionRecord,
  touchDeviceRecord,
} from '@/server/repositories/deviceRepository';
import type { Actor } from '@/types/actor';
import type { ListQuery, ListResult } from '@/types/listQuery';

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

export async function getDeviceSessionUsageRecords(
  actor: Actor,
  query?: ListQuery<'updatedAt' | 'editsUsed'>,
) {
  if (actor.role !== 'owner') {
    return { items: [], totalCount: 0 };
  }

  if (query) {
    return listDeviceSessionUsageRecordsPaginated(query);
  }

  const items = await listDeviceSessionUsageRecords();
  return { items, totalCount: items.length };
}

export async function getDeviceSessionUsageDetail(
  actor: Actor,
  recordId: number,
) {
  if (actor.role !== 'owner') {
    return null;
  }

  const record = await getDeviceSessionUsageRecord(recordId);
  if (!record) return null;

  const editLogs = await getDeviceSessionEditLogs(recordId);

  return { record, editLogs };
}
