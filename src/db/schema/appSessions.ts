import {
    pgTable,
    serial,
    integer,
    varchar,
    text,
    timestamp,
    foreignKey,
    index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const appSessions = pgTable('app_sessions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    sessionToken: text('session_token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
    ipAddress: varchar('ip_address', {length: 45}),
    userAgent: text('user_agent'),
}, (table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete('cascade'),

    index('idx_app_sessions_user').on(table.userId),
    index('idx_app_sessions_token').on(table.sessionToken),
    index('idx_app_sessions_expires').on(table.expiresAt),
]);
