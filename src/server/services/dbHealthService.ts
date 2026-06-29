import { checkConnection } from '@/server/repositories/healthRepository';
import { commonErrors } from '@/server/errors';

export type DbHealthStatus = {
  isConnected: boolean;
  latencyMs: number | null;
  error: string | null;
  dbName: string | null;
};

/**
 * DB接続の健全性をチェックする
 * - `SELECT 1` を実行し、応答時間を計測する
 * - エラー時は内容を返す
 */
export async function checkDbHealth(): Promise<DbHealthStatus> {
  const start = Date.now();
  try {
    const connected = await checkConnection();
    if (!connected) {
      throw new Error('DB connection failed');
    }
    const latencyMs = Date.now() - start;

    const dbName =
      process.env.DATABASE_URL
        ?.replace(/^.*@[^/]+\/([^?]+).*$/, '$1')
        ?.split('?')[0] ?? null;

    return {
      isConnected: true,
      latencyMs,
      error: null,
      dbName,
    };
  } catch (e: unknown) {
    return {
      isConnected: false,
      latencyMs: null,
      error: e instanceof Error ? e.message : commonErrors.unknownError,
      dbName: null,
    };
  }
}
