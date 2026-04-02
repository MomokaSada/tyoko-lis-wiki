import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { contentEditLogs, deviceSessions, devices, editSessions, users } from '@/db/schema';

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

export async function listDeviceSessionUsageRecords() {
  return db
    .select({
      recordId: deviceSessions.id,
      sessionId: deviceSessions.sessionId,
      sessionAuthorId: editSessions.authorId,
      sessionAuthorName: users.name,
      maxEdits: editSessions.maxEdits,
      editsUsed: editSessions.editsUsed,
      sessionIsActive: editSessions.isActive,
      sessionStartAt: editSessions.startAt,
      sessionEndAt: editSessions.endAt,
      sessionCreatedAt: editSessions.createdAt,
      deviceId: devices.id,
      ip: devices.ip,
      browser: devices.browser,
      firstRecordedAt: deviceSessions.createdAt,
      lastRecordedAt: deviceSessions.updatedAt,
      revisionCount: sql<number>`count(${contentEditLogs.id})`,
    })
    .from(deviceSessions)
    .innerJoin(devices, eq(deviceSessions.deviceId, devices.id))
    .innerJoin(editSessions, eq(deviceSessions.sessionId, editSessions.uuid))
    .leftJoin(users, eq(editSessions.authorId, users.id))
    .leftJoin(contentEditLogs, eq(contentEditLogs.deviceSessionId, deviceSessions.id))
    .groupBy(
      deviceSessions.id,
      deviceSessions.sessionId,
      deviceSessions.createdAt,
      deviceSessions.updatedAt,
      editSessions.authorId,
      editSessions.maxEdits,
      editSessions.editsUsed,
      editSessions.isActive,
      editSessions.startAt,
      editSessions.endAt,
      editSessions.createdAt,
      users.name,
      devices.id,
      devices.ip,
      devices.browser,
    )
    .orderBy(desc(deviceSessions.updatedAt), desc(deviceSessions.createdAt));
}
