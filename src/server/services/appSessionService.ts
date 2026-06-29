import { revokeSession } from '@/server/repositories/appSessionRepository';

/**
 * アプリケーションセッションを無効化する。
 * ログアウト時に呼ばれる。
 */
export async function deactivateSession(sessionToken: string) {
  await revokeSession(sessionToken);
}
