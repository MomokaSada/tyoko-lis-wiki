import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { blockDevices, devices, users } from '@/db/schema';

export async function listActiveDevices() {
  return db
    .select({
      id: devices.id,
      ip: devices.ip,
      browser: devices.browser,
    })
    .from(devices)
    .orderBy(desc(devices.createdAt));
}
