import {
    pgTable,
    serial,
    integer,
    varchar,
    timestamp,
    foreignKey,
    jsonb,
} from 'drizzle-orm/pg-core';
import { devices } from './devices';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
    id: serial('id').primaryKey(),
    actorId: integer('actor_id'),
    deviceId: integer('device_id'),
    action: varchar('action', { length: 255 }).notNull(),
    targetId: varchar('target_id', { length: 255 }),
    targetType: varchar('target_type', { length: 255 }),
    detail: jsonb('detail'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.deviceId],
            foreignColumns: [devices.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.actorId],
            foreignColumns: [users.id],
        }).onDelete('cascade'),
    ]
));
