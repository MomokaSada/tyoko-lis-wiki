/**
 * Supabase Auth の fetch/undici タイムアウトを短縮するユーティリティ。
 *
 * supabase.auth.getUser() などの内部で使われる fetch は
 * Node.js の undici がデフォルト 10 秒のコネクトタイムアウトを持つため、
 * Supabase 停止時に応答が返ってくるまで 10 秒待つことになる。
 *
 * この関数は Promise.race で指定ミリ秒後に強制的に reject させることで、
 * 早期に「諦めて未認証として扱う」ことを可能にする。
 */
export const AUTH_TIMEOUT_MS = 3_000;

export function withAuthTimeout<T>(promise: Promise<T>): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`Supabase Auth timed out after ${AUTH_TIMEOUT_MS}ms`)),
      AUTH_TIMEOUT_MS,
    );
  });
  return Promise.race([promise, timeoutPromise]);
}
