import {
    pgTable,
    integer,
    foreignKey,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { contentEditLogs } from './contentEditLogs';
import { tags } from './tags'

export const contentEditLogTags = pgTable('content_edit_log_tags', {
    editLogId: integer('edit_log_id').notNull(),
    tagId: integer('tag_id').notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.editLogId],
            foreignColumns: [contentEditLogs.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.tagId],
            foreignColumns: [tags.id],
        }).onDelete('cascade'),

        primaryKey({
            columns: [
                table.editLogId,
                table.tagId
            ]
        })
    ]
));
