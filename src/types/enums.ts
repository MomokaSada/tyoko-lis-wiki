/**
 * アプリケーション共通の enum 型定義。
 *
 * 値の定義は `lib/enums.ts` の as const 配列が single source of truth。
 * このファイルは UI / Action / Service 層に型情報のみを公開するファサード。
 *
 * ## レイヤー構造
 *
 * ```
 * lib/enums.ts  ←── 単一ソース（値の定義）
 *   ├── db/schema/enums.ts が import して pgEnum 生成
 *   ├── types/enums.ts が型を導出（このファイル）
 *   └── UI / Action / Service 層が利用
 * ```
 *
 * ## 使い方
 * ```ts
 * import type { UserType } from '@/types/enums';
 * ```
 */
import type { USER_TYPES, SNAPSHOT_TYPES, PURPOSE_TYPES } from '@/lib/enums';

/** ユーザータイプ: owner / admin / bot */
export type UserType = (typeof USER_TYPES)[number];

/** スナップショット種別: snapshot / diff */
export type SnapshotType = (typeof SNAPSHOT_TYPES)[number];

/** 認証目的: register / login */
export type PurposeType = (typeof PURPOSE_TYPES)[number];
