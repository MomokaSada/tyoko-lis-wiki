import {
    pgTable,
    serial,
    varchar,
    index,
} from 'drizzle-orm/pg-core';

export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 512 }).notNull(),
}, (table) => ({
    nameIdx: index('idx_tags_name').on(table.name),
}));
