import {
    pgTable,
    serial,
    varchar,
    inet,
    timestamp,
} from 'drizzle-orm/pg-core';

export const devices = pgTable('devices', {
    id: serial('id').primaryKey(),
    ip: inet('ip').notNull(),
    browser: varchar('browser', { length: 512 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
