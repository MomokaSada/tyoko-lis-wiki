import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { devices, deviceSessions } from '@/db/schema';

export async function findDeviceByIpAndBrowser(ip: string, browser: string) {
  const [device] = await db
    .select({
      id: devices.id,
    })
    .from(devices)
    .where(and(eq(devices.ip, ip), eq(devices.browser, browser)))
    .limit(1);

  return device ?? null;
}

export async function createDeviceRecord(input: { ip: string; browser: string }) {
  const [device] = await db
    .insert(devices)
    .values({
      ip: input.ip,
      browser: input.browser,
    })
    .returning({
      id: devices.id,
    });

  return device;
}

export async function touchDeviceRecord(id: number) {
  const [device] = await db
    .update(devices)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(devices.id, id))
    .returning({
      id: devices.id,
    });

  return device ?? null;
}

export async function findDeviceSessionRecord(deviceId: number, sessionId: string) {
  const [record] = await db
    .select({
      id: deviceSessions.id,
    })
    .from(deviceSessions)
    .where(
      and(
        eq(deviceSessions.deviceId, deviceId),
        eq(deviceSessions.sessionId, sessionId),
      ),
    )
    .limit(1);

  return record ?? null;
}

export async function createDeviceSessionRecord(input: {
  deviceId: number;
  sessionId: string;
}) {
  const [record] = await db
    .insert(deviceSessions)
    .values({
      deviceId: input.deviceId,
      sessionId: input.sessionId,
    })
    .returning({
      id: deviceSessions.id,
    });

  return record;
}

export async function touchDeviceSessionRecord(id: number) {
  const [record] = await db
    .update(deviceSessions)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(deviceSessions.id, id))
    .returning({
      id: deviceSessions.id,
    });

  return record ?? null;
}
