import {
    pgTable,
    serial,
    integer,
    varchar,
    foreignKey,
    index,
} from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    parentId: integer('parent_id'),
    name: varchar('name', { length: 512 }).notNull(),
} , (table) => ({
    parentFk: foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
    }).onDelete('cascade'),
    nameIdx: index('idx_categories_name').on(table.name),
}));