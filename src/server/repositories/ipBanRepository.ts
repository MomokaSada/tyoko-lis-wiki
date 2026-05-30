import { and, desc, eq, sql, ilike, or } from 'drizzle-orm';
import { db } from '@/db';
import { blockDevices, devices, users } from '@/db/schema';
import type { ListQuery, ListResult } from '@/types/listQuery';

export async function findDeviceByIp(ip: string) {
  const [device] = await db
    .select({
      id: devices.id,
      ip: devices.ip,
      browser: devices.browser,
    })
    .from(devices)
    .where(eq(devices.ip, ip))
    .limit(1);

  return device ?? null;
}

export async function createDevice(input: { ip: string; browser: string }) {
  const [device] = await db
    .insert(devices)
    .values({
      ip: input.ip,
      browser: input.browser,
    })
    .returning({
      id: devices.id,
      ip: devices.ip,
      browser: devices.browser,
    });

  return device;
}

export async function findActiveBlockByDeviceId(deviceId: number) {
  const [ban] = await db
    .select({
      id: blockDevices.id,
    })
    .from(blockDevices)
    .where(and(eq(blockDevices.deviceId, deviceId), eq(blockDevices.isActive, true)))
    .limit(1);

  return ban ?? null;
}

export async function findActiveBlockByIp(ip: string) {
  const [ban] = await db
    .select({
      id: blockDevices.id,
      reason: blockDevices.reason,
      blockedBy: blockDevices.blockedBy,
      blockedByName: users.name,
      createdAt: blockDevices.createdAt,
    })
    .from(blockDevices)
    .innerJoin(devices, eq(blockDevices.deviceId, devices.id))
    .leftJoin(users, eq(blockDevices.blockedBy, users.id))
    .where(and(eq(devices.ip, ip), eq(blockDevices.isActive, true)))
    .orderBy(desc(blockDevices.createdAt))
    .limit(1);

  return ban ?? null;
}

export async function createBlockDevice(input: {
  deviceId: number;
  blockedBy: number;
  reason: string;
}) {
  const [created] = await db
    .insert(blockDevices)
    .values({
      deviceId: input.deviceId,
      blockedBy: input.blockedBy,
      reason: input.reason,
      isActive: true,
    })
    .returning({
      id: blockDevices.id,
      reason: blockDevices.reason,
    });

  return created;
}

export async function deactivateBlockDeviceById(banId: number) {
  const [updated] = await db
    .update(blockDevices)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(blockDevices.id, banId))
    .returning({
      id: blockDevices.id,
      deviceId: blockDevices.deviceId,
    });

  return updated ?? null;
}

export async function listActiveIpBans(): Promise<ListResult<{
  id: number;
  ip: string;
  browser: string;
  reason: string;
  blockedBy: number;
  blockedByName: string | null;
  createdAt: Date;
}>> {
  const rows = await db
    .select({
      id: blockDevices.id,
      ip: devices.ip,
      browser: devices.browser,
      reason: blockDevices.reason,
      blockedBy: sql<number>`${blockDevices.blockedBy}`,
      blockedByName: users.name,
      createdAt: blockDevices.createdAt,
    })
    .from(blockDevices)
    .innerJoin(devices, eq(blockDevices.deviceId, devices.id))
    .leftJoin(users, eq(blockDevices.blockedBy, users.id))
    .where(eq(blockDevices.isActive, true))
    .orderBy(desc(blockDevices.createdAt));

  return { items: rows, totalCount: rows.length };
}

export async function listActiveIpBansPaginated(
  query?: ListQuery<'createdAt'>,
): Promise<ListResult<{
  id: number;
  ip: string;
  browser: string;
  reason: string;
  blockedBy: number;
  blockedByName: string | null;
  createdAt: Date;
}>> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const offset = (page - 1) * limit;

  const baseWhere = [eq(blockDevices.isActive, true)];
  if (query?.searchQuery) {
    baseWhere.push(ilike(devices.ip, `%${query.searchQuery}%`));
  }

  const rows = await db
    .select({
      id: blockDevices.id,
      ip: devices.ip,
      browser: devices.browser,
      reason: blockDevices.reason,
      blockedBy: sql<number>`${blockDevices.blockedBy}`,
      blockedByName: users.name,
      createdAt: blockDevices.createdAt,
    })
    .from(blockDevices)
    .innerJoin(devices, eq(blockDevices.deviceId, devices.id))
    .leftJoin(users, eq(blockDevices.blockedBy, users.id))
    .where(and(...baseWhere))
    .orderBy(desc(blockDevices.createdAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blockDevices)
    .innerJoin(devices, eq(blockDevices.deviceId, devices.id))
    .where(and(...baseWhere));

  return {
    items: rows,
    totalCount: Number(countResult?.count ?? 0),
  };
}

export async function listIpDeviceRecords(): Promise<ListResult<{
  deviceId: number;
  ip: string;
  browser: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  banId: number | null;
  isBanned: boolean | null;
  banReason: string | null;
  bannedBy: number | null;
  bannedByName: string | null;
  bannedAt: Date | null;
}>> {
  const rows = await db
    .select({
      deviceId: devices.id,
      ip: devices.ip,
      browser: devices.browser,
      firstSeenAt: devices.createdAt,
      lastSeenAt: devices.updatedAt,
      banId: blockDevices.id,
      isBanned: blockDevices.isActive,
      banReason: blockDevices.reason,
      bannedBy: blockDevices.blockedBy,
      bannedByName: users.name,
      bannedAt: blockDevices.createdAt,
    })
    .from(devices)
    .leftJoin(
      blockDevices,
      and(eq(blockDevices.deviceId, devices.id), eq(blockDevices.isActive, true)),
    )
    .leftJoin(users, eq(blockDevices.blockedBy, users.id))
    .orderBy(desc(devices.updatedAt), desc(devices.createdAt));

  return { items: rows, totalCount: rows.length };
}

export async function listIpDeviceRecordsPaginated(
  query?: ListQuery<'lastSeenAt'>,
): Promise<ListResult<{
  deviceId: number;
  ip: string;
  browser: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  banId: number | null;
  isBanned: boolean | null;
  banReason: string | null;
  bannedBy: number | null;
  bannedByName: string | null;
  bannedAt: Date | null;
}>> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const offset = (page - 1) * limit;

  const baseWhere = query?.searchQuery
    ? or(
        ilike(devices.ip, `%${query.searchQuery}%`),
        ilike(devices.browser, `%${query.searchQuery}%`)
      )
    : undefined;

  const rows = await db
    .select({
      deviceId: devices.id,
      ip: devices.ip,
      browser: devices.browser,
      firstSeenAt: devices.createdAt,
      lastSeenAt: devices.updatedAt,
      banId: blockDevices.id,
      isBanned: blockDevices.isActive,
      banReason: blockDevices.reason,
      bannedBy: blockDevices.blockedBy,
      bannedByName: users.name,
      bannedAt: blockDevices.createdAt,
    })
    .from(devices)
    .leftJoin(
      blockDevices,
      and(eq(blockDevices.deviceId, devices.id), eq(blockDevices.isActive, true)),
    )
    .leftJoin(users, eq(blockDevices.blockedBy, users.id))
    .where(baseWhere)
    .orderBy(desc(devices.updatedAt), desc(devices.createdAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(devices)
    .where(baseWhere);

  return {
    items: rows,
    totalCount: Number(countResult?.count ?? 0),
  };
}
