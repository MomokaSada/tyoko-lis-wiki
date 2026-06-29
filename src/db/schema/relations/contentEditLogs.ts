import { relations } from 'drizzle-orm';
import { contentEditLogs } from '../contentEditLogs';
import { contents } from '../contents';
import { deviceSessions } from '../deviceSessions';
import { users } from '../users';
import { contentEditLogTags } from '../contentEditLogTags';
import { contentEditLogCategories } from '../contentEditLogCategories';


export const contentEditLogsRelations = relations(contentEditLogs, ({ one, many }) => ({
    content: one(contents, {
        fields: [contentEditLogs.contentId],
        references: [contents.id],
    }),
    deviceSession: one(deviceSessions, {
        fields: [contentEditLogs.deviceSessionId],
        references: [deviceSessions.id],
    }),
    user: one(users, {
        fields: [contentEditLogs.userId],
        references: [users.id],
    }),
    contentEditLogTags: many(contentEditLogTags),
    contentEditLogCategories: many(contentEditLogCategories),
}));
