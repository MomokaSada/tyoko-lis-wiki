import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ADMIN_ROLES, HEADER_USER_ROLE } from './constants';
import { findActiveEditSession } from '@/server/repositories/editLinkRepository';
import { findActiveAccountCreateSession } from '@/server/repositories/accountCreateLinkRepository';

// ---------- 内部: DB セッション検証（Repository 経由） ----------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * edit_sessions テーブルでトークンの有効性を検証する。
 */
async function verifyEditSession(token: string): Promise<boolean> {
  if (!UUID_REGEX.test(token)) return false;
  const session = await findActiveEditSession(token);
  return session !== null;
}

/**
 * account_create_sessions テーブルでトークンの有効性を検証する。
 */
async function verifyAccountCreateSession(token: string): Promise<boolean> {
  if (!UUID_REGEX.test(token)) return false;
  const session = await findActiveAccountCreateSession(token);
  return session !== null;
}

// ---------- 共通ヘルパー ----------

type SessionKind = 'edit' | 'accountCreate';

/**
 * 共通セッション検証ヘルパー
 *
 * Proxy 側で getUser() は済んでいるため、ここではヘッダーのみ参照する。
 * admin/owner ロールの場合は opts.redirectAdminTo へリダイレクト（指定時）するか、
 * そのままロール情報を返す。
 */
async function validateSession(
  sessionToken: string | null | undefined,
  kind: SessionKind,
  opts: { redirectAdminTo?: string } = {},
) {
  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);

  if (userRole && ADMIN_ROLES.includes(userRole)) {
    if (opts.redirectAdminTo) {
      redirect(opts.redirectAdminTo);
    }
    return { valid: true as const, user: { role: userRole }, token: undefined };
  }

  if (!sessionToken) {
    redirect('/error-pages/unauthorized');
  }

  // Repository 経由でセッションの存在・期限・使用回数をチェック
  const isValid = kind === 'edit'
    ? await verifyEditSession(sessionToken)
    : await verifyAccountCreateSession(sessionToken);

  if (!isValid) {
    redirect('/error-pages/unauthorized');
  }

  return { valid: true as const, user: null, token: sessionToken };
}

// ---------- エクスポート ----------

/**
 * 項目作成・編集ページ用ガード
 */
export async function requireEditSession(sessionToken: string | undefined | null) {
  return validateSession(sessionToken, 'edit');
}

/**
 * アカウント本登録ページ用ガード
 * admin/owner がアクセスした場合はホームにリダイレクトする。
 */
export async function requireAccountCreateSession(sessionToken: string | undefined | null) {
  return validateSession(sessionToken, 'accountCreate', { redirectAdminTo: '/' });
}
