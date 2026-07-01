import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing env var: DATABASE_URL');
}

const globalForDb = global as unknown as { conn: postgres.Sql | undefined };

const conn = globalForDb.conn ?? postgres(connectionString, {
  // Supabase Pooler (port 6543) は prepared statement 非対応
  prepare: false,

  // 最大接続数: Supabase Pro のデフォルトプール上限 (15) を考慮
  max: 10,

  // コネクトタイムアウト: 10秒 (コールドスタート対策)
  connect_timeout: 10,

  // アイドルタイムアウト: 60秒
  // Vercel のサーバーレス関数間で接続を温存し、再接続オーバーヘッドを削減
  idle_timeout: 60,

});

// 本番環境でもグローバルキャッシュを使用（Vercel の serverless 関数は
// 同一インスタンス内でグローバルが保持される）
if (globalForDb.conn === undefined) {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });

/**
 * クエリにタイムアウトを設定するヘルパー。
 * Promise.race で指定秒数経過後に強制 reject する。
 * 使用例:
 *   const result = await queryWithTimeout(db.query.contents.findFirst(), 15_000);
 */
export async function queryWithTimeout<T>(promise: Promise<T>, timeoutMs = 15_000): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeout]);
}
