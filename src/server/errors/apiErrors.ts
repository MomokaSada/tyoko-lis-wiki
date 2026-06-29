/**
 * API Route 層専用エラーメッセージ定数
 * app/api/ 以下の Route Handler のみで使用するメッセージを集約する。
 */
export const apiErrors = {
  // ─── サムネイルアップロード (app/api/uploads/thumbnail) ───
  thumbnail: {
    uploadRateLimitExceeded: 'アップロード試行が多すぎます。しばらくしてから再度お試しください。',
    uploadPermissionDenied: 'サムネイルをアップロードする権限がありません',
    uploadFailed: 'サムネイル画像のアップロードに失敗しました',
  },
} as const;
