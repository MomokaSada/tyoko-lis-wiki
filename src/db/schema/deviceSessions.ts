import {
    pgTable,
    serial,
    uuid,
    integer,
    timestamp,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { devices } from './devices';
import { editSessions } from './editSessions';

export const deviceSessions = pgTable('device_sessions', {
    id: serial('id').primaryKey(),
    deviceId: integer('device_id').notNull(),
    sessionId: uuid('session_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.deviceId],
            foreignColumns: [devices.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.sessionId],
            foreignColumns: [editSessions.uuid],
        }).onDelete('cascade'),
    ]
));
