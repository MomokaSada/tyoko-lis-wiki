export type AuditAction =
    // 認証系
    | 'login'
    | 'login_failed'
    | 'register'
    // アカウント管理
    | 'ban_account'
    | 'unban_account'
    // コンテンツ管理
    | 'create_content'
    | 'update_content'
    | 'delete_content'
    // IP BAN
    | 'create_ip_ban'
    | 'deactivate_ip_ban'
    // リンク管理
    | 'create_edit_link'
    | 'create_account_link'
    | 'deactivate_account_link'
    // カテゴリ管理
    | 'create_category'
    | 'update_category'
    // サムネイル
    | 'cleanup_thumbnails';
