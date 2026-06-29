/**
 * Service 層専用エラーメッセージ定数
 * Service のみで使用し、Action / API Route とは共有しないメッセージを集約する。
 */
export const serviceErrors = {
  // ─── 認証 (authService) ───
  auth: {
    invalidInvitationLink: '招待リンクが無効か期限切れです',
    userNameTaken: 'そのユーザー名はすでに使われています',
    authUserCreateFailed: '認証ユーザーの作成に失敗しました',
  },

  // ─── コンテンツ (contentService) ───
  content: {
    slugGenerateFailed: 'スラッグを生成できませんでした',
    slugAlreadyUsed: 'そのスラッグはすでに使われています',
    contentNotFound: '対象の項目が見つかりません',
  },

  // ─── カテゴリ (taxonomyService) ───
  category: {
    nameRequired: 'カテゴリ名を入力してください',
    nameAlreadyExists: 'そのカテゴリ名はすでに存在します',
    selfParentNotAllowed: '自分自身を親カテゴリにはできません',
    cycleParentDetected: '親カテゴリの設定が循環しています',
    categoryNotFound: '対象のカテゴリが見つかりません',
  },

  // ─── IP BAN (ipBanService) ───
  ipBan: {
    alreadyBanned: 'そのIPはすでにBANされています',
    banNotFound: '対象のIPBANが見つかりません',
    deviceNotFound: '対象のデバイスが見つかりません',
  },

  // ─── 編集リンク (editLinkService) ───
  editLink: {
    createFailed: '編集リンクの生成に失敗しました',
    deactivatePermissionDenied: '権限がありません',
    linkNotFound: 'リンクが見つかりませんでした',
  },

  // ─── アカウント作成リンク (accountCreateLinkService) ───
  accountCreateLink: {
    createFailed: 'Failed to create account create link',
    linkNotFound: '対象のリンクが見つかりません',
  },

  // ─── アカウント BAN (accountBanService) ───
  accountBan: {
    selfBanNotAllowed: '自分自身はBANできません',
    userNotFound: '対象ユーザーが見つかりません',
    alreadyBanned: 'このアカウントは既にBANされています',
    notBanned: 'このアカウントはBANされていません',
  },

  // ─── サムネイル (thumbnailService) ───
  thumbnail: {
    cleanupPermissionDenied: '未使用サムネイルの掃除権限がありません',
  },
} as const;
