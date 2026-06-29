/**
 * ロール定数。
 *
 * 値の実体は `lib/enums.ts` が単一ソース。
 * このファイルでは意味的に名前をつけて re-export する。
 */
export { ROLES, ADMIN_ROLES } from '@/lib/enums';

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
