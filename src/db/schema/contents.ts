import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
} from 'drizzle-orm/pg-core';

export const contents = pgTable('contents', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    currentTitle: varchar('current_title', { length: 255 }).notNull(),
    currentContent: text('current_content').notNull(),
    currentThumbnail: varchar('current_thumbnail', { length: 512 }),
    latestRevision: integer('latest_revision'),
    viewCount: integer('view_count').default(0).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
