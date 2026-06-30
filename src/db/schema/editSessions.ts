import {
    pgTable,
    uuid,
    integer,
    boolean,
    timestamp,
    foreignKey,
    index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const editSessions = pgTable('edit_sessions', {
    uuid: uuid('uuid').primaryKey(),
    authorId: integer('author_id').notNull(),
    maxEdits: integer('max_edits').default(50).notNull(),
    editsUsed: integer('edits_used').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    startAt: timestamp('start_at').defaultNow().notNull(),
    endAt: timestamp('end_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
} , (table) => ({
    authorFk: foreignKey({
        columns: [table.authorId],
        foreignColumns: [users.id],
    }).onDelete('cascade'),
    authorIdIdx: index('idx_edit_sessions_author_id').on(table.authorId),
    createdAtIdx: index('idx_edit_sessions_created_at').on(table.createdAt),
}));

