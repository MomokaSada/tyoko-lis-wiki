import {
    pgTable,
    integer,
    foreignKey,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { contents } from './contents';
import { tags } from './tags'

export const contentTags = pgTable('content_tags', {
    contentId: integer('content_id').notNull(),
    tagId: integer('tag_id').notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.contentId],
            foreignColumns: [contents.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.tagId],
            foreignColumns: [tags.id],
        }).onDelete('cascade'),

        primaryKey({
            columns: [
                table.contentId,
                table.tagId
            ]
        })
    ]
));
