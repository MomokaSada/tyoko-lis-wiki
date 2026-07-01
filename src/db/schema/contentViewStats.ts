import {
    pgTable,
    serial,
    integer,
    date,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';
import { contents } from './contents';

export const contentViewStats = pgTable('content_view_stats', {
    id: serial('id').primaryKey(),
    contentId: integer('content_id')
        .references(() => contents.id, { onDelete: 'cascade' })
        .notNull(),
    date: date('date').notNull(),
    viewCount: integer('view_count').default(1).notNull(),
}, (table) => {
    return {
        contentDateIdx: uniqueIndex('content_view_stats_content_date_idx').on(table.contentId, table.date),
        dateIdx: index('idx_content_view_stats_date').on(table.date),
    };
});
