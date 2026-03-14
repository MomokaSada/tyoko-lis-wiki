import { relations } from 'drizzle-orm';
import { accountCreateSessions } from '../accountCreateSessions';
import { users } from '../users';

export const accountCreateSessionsRelations = relations(accountCreateSessions, ({ one }) => ({
    user: one(users, {
        fields: [accountCreateSessions.authorId],
        references: [users.id],
    }),
}));
