/**
 * Action 層専用エラーメッセージ定数
 * Action のみで使用し、Service / API Route とは共有しないメッセージを集約する。
 */
export const actionErrors = {
  // ─── パスキー (passkeyActions) ───
  passkey: {
    loginRequired: 'ログインが必須です',
    userNotFound: 'ユーザー情報が見つかりません',
    credentialParseFailed: '認証情報のパースに失敗しました',
    challengeNotFound: 'チャレンジ情報が見つかりません。もう一度やり直してください',
    challengeNotFoundWithPeriod: 'チャレンジ情報が見つかりません。もう一度やり直してください。',
    challengeExpired: 'チャレンジが見つかりません。もう一度やり直してください',
    verificationFailed: '認証に失敗しました',
    credentialNotFound: '認証情報が見つかりません',
    credentialParseFailedAlt: '認証情報のパーズに失敗しました',
    sessionCreateFailed: 'セッション作成に失敗しました',
    sessionCreateFailedLong: 'セッションの作成に失敗しました。再度ログインしてください',
    verificationError: '認証中にエラーが発生しました',
    verificationProcessError: '認証処理中にエラーが発生しました',
    userNameNotFound: 'ユーザー名が見つかりません',
    passwordNotFound: 'パスワードが見つかりません',
  },

  // ─── アカウント BAN (accountBanActions) ───
  accountBan: {
    banRateLimit: 'BAN試行が多すぎます。しばらくしてから再度お試しください。',
    operationRateLimit: '操作が多すぎます。しばらくしてから再度お試しください。',
  },
} as const;
