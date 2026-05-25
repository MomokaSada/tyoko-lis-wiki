import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';
import { escapeLikePattern } from './modules/escapeLike';
import { db } from '@/db';
import { contentEditLogs, deviceSessions, devices, editSessions, users } from '@/db/schema';
import type { ListQuery, ListResult } from '@/types/listQuery';

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

export type DeviceSessionUsageRecordRow = {
  recordId: number;
  sessionId: string;
  sessionAuthorId: number | null;
  sessionAuthorName: string | null;
  maxEdits: number;
  editsUsed: number;
  sessionIsActive: boolean;
  sessionStartAt: Date;
  sessionEndAt: Date;
  sessionCreatedAt: Date;
  deviceId: number;
  ip: string;
  browser: string;
  firstRecordedAt: Date;
  lastRecordedAt: Date;
  revisionCount: number;
};

const usageRecordQuery = {
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
};

const usageRecordGroupBy = [
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
];

export async function listDeviceSessionUsageRecords() {
  return db
    .select(usageRecordQuery)
    .from(deviceSessions)
    .innerJoin(devices, eq(deviceSessions.deviceId, devices.id))
    .innerJoin(editSessions, eq(deviceSessions.sessionId, editSessions.uuid))
    .leftJoin(users, eq(editSessions.authorId, users.id))
    .leftJoin(contentEditLogs, eq(contentEditLogs.deviceSessionId, deviceSessions.id))
    .groupBy(...usageRecordGroupBy)
    .orderBy(desc(deviceSessions.updatedAt), desc(deviceSessions.createdAt));
}

export async function listDeviceSessionUsageRecordsPaginated(
  query?: ListQuery<'updatedAt' | 'editsUsed'>,
): Promise<ListResult<DeviceSessionUsageRecordRow>> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (query?.searchQuery) {
    const escaped = escapeLikePattern(query.searchQuery);
    conditions.push(
      ilike(deviceSessions.sessionId, `%${escaped}%`),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByColumn = query?.sortBy === 'editsUsed'
    ? editSessions.editsUsed
    : deviceSessions.updatedAt;
  const orderByDir = query?.sortOrder === 'asc' ? asc : desc;

  const rows = await db
    .select(usageRecordQuery)
    .from(deviceSessions)
    .innerJoin(devices, eq(deviceSessions.deviceId, devices.id))
    .innerJoin(editSessions, eq(deviceSessions.sessionId, editSessions.uuid))
    .leftJoin(users, eq(editSessions.authorId, users.id))
    .leftJoin(contentEditLogs, eq(contentEditLogs.deviceSessionId, deviceSessions.id))
    .where(where)
    .groupBy(...usageRecordGroupBy)
    .orderBy(orderByDir(orderByColumn))
    .limit(limit)
    .offset(offset);

  // Count query needs a subquery since it has GROUP BY
  const countSubquery = db
    .select({ id: deviceSessions.id })
    .from(deviceSessions)
    .innerJoin(devices, eq(deviceSessions.deviceId, devices.id))
    .innerJoin(editSessions, eq(deviceSessions.sessionId, editSessions.uuid))
    .leftJoin(users, eq(editSessions.authorId, users.id))
    .where(where)
    .as('count_sub');

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(countSubquery);

  return {
    items: rows,
    totalCount: Number(countResult?.count ?? 0),
  };
}
