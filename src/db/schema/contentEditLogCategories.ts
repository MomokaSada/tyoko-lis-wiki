import {
    pgTable,
    integer,
    foreignKey,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { contentEditLogs } from './contentEditLogs';
import { categories } from './categories'

export const contentEditLogCategories = pgTable('content_edit_log_categories', {
    editLogId: integer('edit_log_id').notNull(),
    categoryId: integer('category_id').notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.editLogId],
            foreignColumns: [contentEditLogs.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.categoryId],
            foreignColumns: [categories.id],
        }).onDelete('cascade'),

        primaryKey({
            columns: [
                table.editLogId,
                table.categoryId
            ]
        })
    ]
));
