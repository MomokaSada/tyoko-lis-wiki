import {
    pgTable,
    uuid,
    integer,
    timestamp,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const accountCreateSessions = pgTable('account_create_sessions', {
    uuid: uuid('uuid').primaryKey(),
    authorId: integer('author_id').notNull(),
    endAt: timestamp('end_at').notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.authorId],
            foreignColumns: [users.id],
        }).onDelete('cascade'),
    ]
));
