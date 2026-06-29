/**
 * アプリケーション共通の enum 定義。
 *
 * 全レイヤーで使用する enum 値を as const 配列で定義する単一ソース。
 *
 * ## レイヤー間の依存方向
 *
 * ```
 * lib/enums.ts  ←── 単一ソース（値の定義）
 *   ├── db/schema/enums.ts が import して pgEnum() に渡す
 *   ├── types/enums.ts が型を導出して re-export
 *   ├── UI / Action / Service 層が値または型として利用
 *   └── lib/auth/constants.ts など他の定数ファイルが参照
 * ```
 *
 * ## 使い方
 * ```ts
 * import { USER_TYPES } from '@/lib/enums';
 * import type { UserType } from '@/types/enums';
 * ```
 */

// ---------------------------------------------------------------------------
// UserType: ユーザーの権限種別
// ---------------------------------------------------------------------------
export const USER_TYPES = ['owner', 'admin', 'bot'] as const;

/** 操作可能なロールのグループ分け（lib/auth/constants.ts から移行） */
export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

/** admin 以上のロール一覧 */
export const ADMIN_ROLES: readonly string[] = [ROLES.ADMIN, ROLES.OWNER] as const;

// ---------------------------------------------------------------------------
// SnapshotType: スナップショットの種別
// ---------------------------------------------------------------------------
export const SNAPSHOT_TYPES = ['snapshot', 'diff'] as const;

// ---------------------------------------------------------------------------
// PurposeType: 認証・チャレンジの目的
// ---------------------------------------------------------------------------
export const PURPOSE_TYPES = ['register', 'login'] as const;
