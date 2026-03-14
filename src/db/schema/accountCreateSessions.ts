import {
    pgTable,
    uuid,
    integer,
    boolean,
    timestamp,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const accountCreateSessions = pgTable('account_create_sessions', {
    uuid: uuid('uuid').primaryKey(),
    authorId: integer('author_id').notNull(),
    isActive: boolean('is_active').notNull(),
    startAt: timestamp('start_at').defaultNow().notNull(),
    endAt: timestamp('end_at').notNull(),
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
