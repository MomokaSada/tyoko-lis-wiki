import {
    pgTable,
    integer,
    foreignKey,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { contents } from './contents';
import { categories } from './categories'

export const contentCategories = pgTable('content_categories', {
    contentId: integer('content_id').notNull(),
    categoryId: integer('category_id').notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.contentId],
            foreignColumns: [contents.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.categoryId],
            foreignColumns: [categories.id],
        }).onDelete('cascade'),

        primaryKey({
            columns: [
                table.contentId,
                table.categoryId
            ]
        })
    ]
));
