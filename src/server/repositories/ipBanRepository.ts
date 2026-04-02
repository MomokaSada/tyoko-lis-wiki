import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { blockDevices, devices, users } from '@/db/schema';

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
    .where(eq(blockDevices.deviceId, deviceId))
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

export async function listActiveIpBans() {
  return db
    .select({
      id: blockDevices.id,
      ip: devices.ip,
      browser: devices.browser,
      reason: blockDevices.reason,
      blockedBy: blockDevices.blockedBy,
      blockedByName: users.name,
      createdAt: blockDevices.createdAt,
    })
    .from(blockDevices)
    .innerJoin(devices, eq(blockDevices.deviceId, devices.id))
    .leftJoin(users, eq(blockDevices.blockedBy, users.id))
    .where(eq(blockDevices.isActive, true))
    .orderBy(desc(blockDevices.createdAt));
}

export async function listIpDeviceRecords() {
  return db
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
}
