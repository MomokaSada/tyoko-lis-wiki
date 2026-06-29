/**
 * DB クエリを安全に実行するラッパー。
 * DB 不通時もアプリがクラッシュせず、フォールバック値を返す。
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  context?: string,
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[safeQuery] DB query failed (${context ?? 'unknown'}):`, error);
    }
    return fallback;
  }
}
