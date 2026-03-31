import { getCurrentRequestDevice } from '@/server/lib/requestDevice';
import {
  createDeviceRecord,
  findDeviceByIpAndBrowser,
  touchDeviceRecord,
} from '@/server/repositories/deviceRepository';

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
