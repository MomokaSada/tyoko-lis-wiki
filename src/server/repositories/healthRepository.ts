import { sql } from 'drizzle-orm';
import { db } from '@/db';

/**
 * DB接続の健全性チェックを行う Repository。
 * Service 層が直接 `db.execute` を呼ばないよう分離する。
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1 AS ok`);
    return true;
  } catch {
    return false;
  }
}
