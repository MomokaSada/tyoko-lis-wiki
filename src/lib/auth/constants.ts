/** ロール定数 */
export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

/** admin 以上のロール一覧 */
export const ADMIN_ROLES: readonly string[] = [ROLES.ADMIN, ROLES.OWNER];

/** Proxy → Page へ受け渡すカスタムヘッダー名 */
export const HEADER_USER_ROLE = 'x-user-role';

/** Proxy → Server 側へ受け渡す正規化済みクライアント IP */
export const HEADER_CLIENT_IP = 'x-client-ip';

/** Proxy → Server Component へ受け渡す「保護ルートかどうか」のフラグ */
export const HEADER_IS_PROTECTED = 'x-is-protected';

/** よく使うパス */
export const PATHS = {
  HOME: '/',
  /** 存在しないパス → Next.js が not-found.tsx を表示する */
  NOT_FOUND: '/_errors/not-found',
} as const;
