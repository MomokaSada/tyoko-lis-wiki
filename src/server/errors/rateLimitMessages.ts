/**
 * レート制限エラーメッセージの一元管理。
 * withAction.ts から参照され、全 Server Action で統一メッセージを使う。
 *
 * ## 使い方
 * ```ts
 * import { getRateLimitMessage } from '@/server/errors';
 * const message = getRateLimitMessage('createContent');
 * ```
 */
import type { RateLimitAction } from '@/server/lib/rateLimit';

const RATE_LIMIT_MESSAGES: Record<RateLimitAction, string> = {
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

/** レート制限アクション名に対応するエラーメッセージを返す */
export function getRateLimitMessage(action: RateLimitAction): string {
  return RATE_LIMIT_MESSAGES[action];
}
