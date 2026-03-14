import { relations } from 'drizzle-orm';
import { users } from '../users';
import { accountCreateSessions } from '../accountCreateSessions';
import { editSessions } from '../editSessions';
import { blockDevices } from '../blockDevices';
import { contentEditLogs } from '../contentEditLogs';

export const usersRelations = relations(users, ({ one, many }) => ({
    accountCreateSession: one(accountCreateSessions, {
        fields: [users.accountCreateSessionId],
        references: [accountCreateSessions.uuid],
    }),
    editSessions: many(editSessions),
    accountCreateSessionsCreated: many(accountCreateSessions),
    blockDevicesCreated: many(blockDevices),
    contentEditLogs: many(contentEditLogs),
}));
