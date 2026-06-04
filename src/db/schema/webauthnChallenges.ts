import {
    pgTable,
    serial,
    integer,
    text,
    timestamp,
    foreignKey,
    index,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { purposeTypeEnum } from './enums';

export const webauthnChallenges = pgTable('webauthn_challenges', {
    id: serial('id').primaryKey(),
    userId: integer('user_id'),
    purpose: purposeTypeEnum('purpose').notNull(),
    challenge: text('challenge').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    consumedAt: timestamp('consumed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
},(table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete('cascade'),

    index('idx_webauthn_challenges_user').on(table.userId),
    index('idx_webauthn_challenges_expires').on(table.expiresAt),
]);
