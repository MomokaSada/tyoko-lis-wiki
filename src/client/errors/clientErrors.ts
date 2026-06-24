/**
 * クライアント側エラーメッセージ定数
 * 'use client' コンポーネントのみで使用するメッセージを集約する。
 *
 * テンプレートリテラルを含むメッセージは関数として定義する。
 */
export const clientErrors = {
  // ─── パスキー (lib/passkey/client.ts) ───
  passkey: {
    registrationOptionsFailed: '登録オプションの生成に失敗しました',
    challengeFailed: 'チャレンジ情報の生成に失敗しました',
    authenticationOptionsFailed: '認証オプションの生成に失敗しました',
    passkeyCreationFailed: (message: string) => `パスキーの作成に失敗しました: ${message}`,
    passkeyAuthFailed: (message: string) => `パスキー認証に失敗しました: ${message}`,
    passkeyRegistrationFailed: (error: string) => `パスキーの登録に失敗しました: ${error}`,
  },
} as const;
