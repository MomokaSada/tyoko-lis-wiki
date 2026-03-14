import { relations } from 'drizzle-orm';
import { deviceSessions } from '../deviceSessions';
import { devices } from '../devices';
import { editSessions } from '../editSessions';
import { contentEditLogs } from '../contentEditLogs';

export const deviceSessionsRelations = relations(deviceSessions, ({ one, many }) => ({
    device: one(devices, {
        fields: [deviceSessions.deviceId],
        references: [devices.id],
    }),
    editSession: one(editSessions, {
        fields: [deviceSessions.sessionId],
        references: [editSessions.uuid],
    }),
    contentEditLogs: many(contentEditLogs),
}));
