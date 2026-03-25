import {
    pgTable,
    uuid,
    integer,
    timestamp,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const editSessions = pgTable('edit_sessions', {
    uuid: uuid('uuid').primaryKey(),
    authorId: integer('author_id').notNull(),
    maxEdits: integer('max_edits').default(50).notNull(),
    editsUsed: integer('edits_used').default(0).notNull(),
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
