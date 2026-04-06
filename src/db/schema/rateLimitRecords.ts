import {
    pgTable,
    serial,
    inet,
    timestamp,
    varchar,
    index,
} from 'drizzle-orm/pg-core';

export const rateLimitRecords = pgTable('rate_limit_records', {
    id: serial('id').primaryKey(),
    ip: inet('ip').notNull(),
    action: varchar('action', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index("idx_rate_limit_records_lookup").on(table.ip, table.action, table.createdAt),
]);
