import { relations } from 'drizzle-orm';
import { users } from '../users';
import { passkeys } from '../passkeys';

export const passkeysRelations = relations(passkeys, ({ one }) => ({
    user: one(users, {
        fields: [passkeys.userId],
        references: [users.id],
    }),
}));
