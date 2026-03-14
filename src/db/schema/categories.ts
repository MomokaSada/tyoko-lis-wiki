import {
    pgTable,
    serial,
    integer,
    varchar,
    foreignKey,
} from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    parentId: integer('parent_id'),
    name: varchar('name', { length: 512 }).notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.parentId],
            foreignColumns: [table.id],
        }).onDelete('cascade'),
    ]
));