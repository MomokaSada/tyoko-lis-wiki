/** ロール定数 */
export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

/** admin 以上のロール一覧 */
export const ADMIN_ROLES: readonly string[] = [ROLES.ADMIN, ROLES.OWNER];

/** Proxy → Page へ受け渡すカスタムヘッダー名 */
export const HEADER_USER_ROLE = 'x-user-role';

/** よく使うパス */
export const PATHS = {
  HOME: '/',
  UNAUTHORIZED: '/error/unauthorized',
} as const;
