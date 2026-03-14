import {
    pgTable,
    serial,
    integer,
    boolean,
    varchar,
    timestamp,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { devices } from './devices';
import { users } from './users';

export const blockDevices = pgTable('block_devices', {
    id: serial('id').primaryKey(),
    deviceId: integer('device_id').notNull(),
    blockedBy: integer('blocked_by').notNull(),
    reason: varchar('reason', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
} , (table) => (
    [
        foreignKey({
            columns: [table.deviceId],
            foreignColumns: [devices.id],
        }).onDelete('cascade'),

        foreignKey({
            columns: [table.blockedBy],
            foreignColumns: [users.id],
        }).onDelete('cascade'),
    ]
));
