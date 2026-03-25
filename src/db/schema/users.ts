import {
    pgTable,
    serial,
    varchar,
    boolean,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';
import { userTypeEnum } from './enums';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    accountCreateSessionId: uuid('account_create_session_id'),
    name: varchar('name', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    type: userTypeEnum('type').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});