import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing env var: DATABASE_URL');
}

const globalForDb = global as unknown as { conn: postgres.Sql | undefined };
const conn = globalForDb.conn ?? postgres(connectionString, {
  prepare: false,
  max: 1,
  connect_timeout: 3,
  idle_timeout: 1,
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
