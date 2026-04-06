import { relations } from 'drizzle-orm';
import { auditLogs } from '../auditLogs';
import { devices } from '../devices';
import { users } from '../users';

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    device: one(devices, {
        fields: [auditLogs.deviceId],
        references: [devices.id],
    }),
    user: one(users, {
        fields: [auditLogs.actorId],
        references: [users.id],
    }),
}));
