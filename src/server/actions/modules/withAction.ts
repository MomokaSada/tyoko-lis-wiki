/**
 * Server Action の定型前処理をまとめたユーティリティ。
 *
 * ## 使い方
 *
 * ```ts
 * // デバイス記録 + レート制限
 * const preflight = await withAction({ rateLimit: 'login' });
 * if (preflight) return preflight;
 *
 * // アクター認証
 * const actor = await requireActor();
 * if ('error' in actor) return actor;
 *
 * // Zod パース
 * const parsed = parseOrError(schema, raw);
 * if ('error' in parsed) return parsed;
 * ```
 *
 * ## 導入方針
 * - authActions, contentActions, categoryActions から段階導入する
 * - 最初から完璧な汎用化を目指さず、徐々に適用範囲を広げる
 */

import { recordCurrentRequestDevice } from '@/server/services/deviceService';
import { checkRateLimit } from '@/server/services/rateLimitService';

import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { RateLimitAction } from '@/server/lib/rateLimit';

import { commonErrors } from '@/server/errors';

import type { PrivilegedActor } from '@/types/actor';
import type { BaseActionState } from '@/types/actionState';
import type { z } from 'zod';

// ---------------------------------------------------------------------------
// Preflight
// ---------------------------------------------------------------------------

export type WithActionOptions = {
  /** レート制限のアクション名。指定した場合はチェックを行い、超過時エラーを返す */
  rateLimit?: RateLimitAction;
  /** デバイス情報の記録 (デフォルト: true) */
  device?: boolean;
};

/**
 * Action 実行前の共通処理（デバイス記録、レート制限）をまとめて実行する。
 * エラーがあれば BaseActionState 互換の `{ error: string }` を返し、
 * 成功すれば `null` を返す。
 *
 * @example
 * const preflight = await withAction({ rateLimit: 'login' });
 * if (preflight) return preflight;
 */
export async function withAction(
  options: WithActionOptions = {},
): Promise<Pick<BaseActionState, 'error'> | null> {
  if (options.device !== false) {
    await recordCurrentRequestDevice();
  }

  if (options.rateLimit) {
    const result = await checkRateLimit(options.rateLimit);
    if (!result.allowed) {
      return { error: getRateLimitMessage(options.rateLimit) };
    }
  }

  return null;
}

function getRateLimitMessage(action: RateLimitAction): string {
  const messages: Record<RateLimitAction, string> = {
    login: 'ログイン試行が多すぎます。しばらくしてから再度お試しください。',
    register: 'アカウント作成試行が多すぎます。しばらくしてから再度お試しください。',
    createContent: '項目作成試行が多すぎます。しばらくしてから再度お試しください。',
    updateContent: '項目編集試行が多すぎます。しばらくしてから再度お試しください。',
    deleteContent: '項目削除試行が多すぎます。しばらくしてから再度お試しください。',
    thumbnailUpload: 'サムネイルアップロード試行が多すぎます。しばらくしてから再度お試しください。',
    createCategory: 'カテゴリ作成試行が多すぎます。しばらくしてから再度お試しください。',
    updateCategory: 'カテゴリ更新試行が多すぎます。しばらくしてから再度お試しください。',
    deleteCategory: 'カテゴリ削除試行が多すぎます。しばらくしてから再度お試しください。',
    createIpBan: 'IPBAN作成試行が多すぎます。しばらくしてから再度お試しください。',
    createEditLink: '編集リンク作成試行が多すぎます。しばらくしてから再度お試しください。',
    createAccountCreateLink: 'アカウント作成リンク作成試行が多すぎます。しばらくしてから再度お試しください。',
    deactivateEditLink: '操作が多すぎます。しばらくしてから再度お試しください。',
    banAccount: 'BAN試行が多すぎます。しばらくしてから再度お試しください。',
  };
  return messages[action];
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * 現在のアクター（特権ユーザー）を取得する。
 * 未ログインまたは権限不足の場合はエラー文字列を含むオブジェクトを返す。
 *
 * @example
 * const actor = await requireActor();
 * if ('error' in actor) return actor;
 */
export async function requireActor(): Promise<
  PrivilegedActor | { error: string }
> {
  const actor = await getCurrentActor();
  if (!actor) return { error: commonErrors.permissionDenied };
  return actor;
}

// ---------------------------------------------------------------------------
// Schema parse
// ---------------------------------------------------------------------------

export type SafeParseResult<T> =
  | { parsed: T }
  | { error: string };

/**
 * Zod スキーマで値をパースする。
 * 失敗時は最初のエラーメッセージを含む `{ error: string }` を返す。
 *
 * @example
 * const parsed = parseOrError(loginSchema, raw);
 * if ('error' in parsed) return parsed;
 * // parsed.parsed が安全に使える
 */
export function parseOrError<T>(
  schema: z.ZodType<T>,
  data: unknown,
): SafeParseResult<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { error: getFirstZodErrorMessage(result.error) };
  }
  return { parsed: result.data };
}
