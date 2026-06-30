import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    index,
} from 'drizzle-orm/pg-core';

export const contents = pgTable('contents', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    currentTitle: varchar('current_title', { length: 255 }).notNull(),
    currentContent: text('current_content').notNull(),
    currentThumbnail: text('current_thumbnail'),
    latestRevision: integer('latest_revision'),
    viewCount: integer('view_count').default(0).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    updatedAtIdx: index('idx_contents_updated_at').on(table.updatedAt),
    isPublishedIdx: index('idx_contents_is_published').on(table.isPublished),
    createdAtIdx: index('idx_contents_created_at').on(table.createdAt),
}));
