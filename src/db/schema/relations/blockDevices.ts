import { relations } from 'drizzle-orm';
import { blockDevices } from '../blockDevices';
import { devices } from '../devices';
import { users } from '../users';

export const blockDevicesRelations = relations(blockDevices, ({ one }) => ({
    device: one(devices, {
        fields: [blockDevices.deviceId],
        references: [devices.id],
    }),
    user: one(users, {
        fields: [blockDevices.blockedBy],
        references: [users.id],
    }),
}));
