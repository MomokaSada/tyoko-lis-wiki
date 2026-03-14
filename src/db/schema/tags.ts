import {
    pgTable,
    serial,
    varchar,
} from 'drizzle-orm/pg-core';

export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 512 }).notNull(),
});
