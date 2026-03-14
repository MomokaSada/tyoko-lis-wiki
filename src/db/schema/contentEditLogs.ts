import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    timestamp,
    boolean,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { contents } from './contents';
import { deviceSessions } from './deviceSessions';
import { users } from './users';
import { snapshotTypeEnum } from './enums';

export const contentEditLogs = pgTable('content_edit_logs', {
    id: serial('id').primaryKey(),
    contentId: integer('content_id').notNull(),
    deviceSessionId: integer('device_session_id'),
    userId: integer('user_id'),
    revisionNumber: integer('revision_number').notNull(),
    type: snapshotTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }),
    data: text('data'),
    thumbnail: varchar('thumbnail', { length: 512 }),
    tagChanged: boolean('tag_changed'),
    categoryChanged: boolean('category_changed'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.contentId],
            foreignColumns: [contents.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.deviceSessionId],
            foreignColumns: [deviceSessions.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
        }).onDelete('cascade'),
    ]
));
