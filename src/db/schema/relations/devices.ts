import { relations } from 'drizzle-orm';
import { devices } from '../devices';
import { deviceSessions } from '../deviceSessions';
import { blockDevices } from '../blockDevices';

export const devicesRelations = relations(devices, ({ many }) => ({
    deviceSessions: many(deviceSessions),
    blockDevices: many(blockDevices),
}));
