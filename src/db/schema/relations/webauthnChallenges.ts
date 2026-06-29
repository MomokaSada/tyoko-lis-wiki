import { relations } from 'drizzle-orm';
import { users } from '../users';
import { webauthnChallenges } from '../webauthnChallenges';

export const webauthnChallengesRelations = relations(webauthnChallenges, ({ one }) => ({
    user: one(users, {
        fields: [webauthnChallenges.userId],
        references: [users.id],
    }),
}));
