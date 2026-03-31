import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { devices } from '@/db/schema';

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
