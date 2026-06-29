import { relations } from 'drizzle-orm';
import { users } from '../users';
import { appSessions } from '../appSessions';

export const appSessionsRelations = relations(appSessions, ({ one }) => ({
    user: one(users, {
        fields: [appSessions.userId],
        references: [users.id],
    }),
}));
