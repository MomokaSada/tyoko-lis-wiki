import { relations } from 'drizzle-orm';
import { editSessions } from '../editSessions';
import { users } from '../users';
import { deviceSessions } from '../deviceSessions';

export const editSessionsRelations = relations(editSessions, ({ one, many }) => ({
    user: one(users, {
        fields: [editSessions.authorId],
        references: [users.id],
    }),
    deviceSessions: many(deviceSessions),
}));
