import {
    pgTable,
    serial,
    integer,
    varchar,
    text,
    boolean,
    timestamp,
    foreignKey,
    index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const passkeys = pgTable('passkeys', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    credentialId: text('credential_id').notNull().unique(),
    publicKey: text('public_key').notNull(),
    counter: integer('counter').notNull().default(0),
    transports: varchar('transports', { length: 255 }).default(''),
    deviceName: varchar('device_name',{length: 255}).default(''),
    backedUp: boolean('backed_up').default(false),
    deviceType: varchar('device_type',{length: 100}).default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
}, (table) => [
    foreignKey({
        columns:[table.userId],
        foreignColumns: [users.id],
    }).onDelete('cascade'),

    index('idx_passkeys_user_id').on(table.userId),
    index('idx_passkeys_credential_id').on(table.credentialId),
]);