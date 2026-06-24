/**
 * 共通エラーメッセージ定数
 * Action / Service / API Route のうち複数レイヤー横断で使われるメッセージを集約する。
 */
export const commonErrors = {
  // ─── 全レイヤー横断 ───
  permissionDenied: '権限がありません',
  unauthorized: 'Unauthorized',
  unknownError: 'Unknown error',

  // ─── IP 制限（action 横断） ───
  ip: {
    loginNotAllowed: 'このIPアドレスからのログインは許可されていません',
    registerNotAllowed: 'このIPアドレスからのアカウント作成は許可されていません',
    contentCreateNotAllowed: 'このIPアドレスからの項目作成は許可されていません',
    contentEditNotAllowed: 'このIPアドレスからの項目編集は許可されていません',
  },

  // ─── 認証 (authActions + authService) ───
  auth: {
    accountBanned: 'このアカウントはBANされています',
    invalidCredentials: 'ユーザー名またはパスワードが正しくありません',
  },

  // ─── コンテンツ (contentActions + contentService) ───
  content: {
    createPermissionDenied: '項目作成権限がありません',
    editPermissionDenied: '項目編集権限がありません',
    deletePermissionDenied: '項目削除権限がありません',
  },

  // ─── カテゴリ (categoryActions + taxonomyService) ───
  category: {
    adminPermissionDenied: 'カテゴリ管理権限がありません',
  },

  // ─── IP BAN (ipBanActions + ipBanService) ───
  ipBan: {
    createPermissionDenied: 'IPBAN 権限がありません',
    deactivatePermissionDenied: 'IPBAN 解除権限がありません',
  },

  // ─── 編集リンク (editLinkActions + editLinkService) ───
  editLink: {
    createPermissionDenied: 'リンク発行権限がありません',
  },

  // ─── アカウント作成リンク (accountCreateLinkActions + accountCreateLinkService) ───
  accountCreateLink: {
    createPermissionDenied: 'リンク発行権限がありません',
    deactivatePermissionDenied: 'リンク無効化権限がありません',
  },

  // ─── アカウント BAN (accountBanActions + accountBanService) ───
  accountBan: {
    banPermissionDenied: 'アカウントBAN権限がありません',
    unbanPermissionDenied: 'アカウントBAN解除権限がありません',
  },
} as const;
