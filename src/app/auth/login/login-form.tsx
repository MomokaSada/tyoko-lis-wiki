'use client';

import {
  useActionState,
  useState,
} from 'react';
import { loginAction } from '@/server/actions/authActions';
import { loginWithPasskey, loginAndRegisterPasskey } from '@/lib/passkey/client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });
  const router = useRouter();
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyFallback, setPasskeyFallback] = useState(false);
  const [fallbackPending, setFallbackPending] = useState(false);

  // 通常フォームとフォールバックフォームで共有する入力値（ブラウザ自動入力による上書きを防ぐため制御コンポーネント化）
  const [normalUserName, setNormalUserName] = useState('');
  const [normalPassword, setNormalPassword] = useState('');

  // ------------------------------------------------------------------
  // パスキーログイン（通常）
  // ------------------------------------------------------------------
  const handlePasskeyLogin = async () => {
    setPasskeyPending(true);
    setPasskeyError(null);

    try {
      const result = await loginWithPasskey();
      if (result.error) {
        // パスキーがない or 失敗 → フォールバックフォームへ
        setPasskeyError(result.error);
        setPasskeyFallback(true);
        return;
      }
      router.refresh();
    } catch (err) {
      setPasskeyError(err instanceof Error ? err.message : 'パスキー認証に失敗しました');
      setPasskeyFallback(true);
    } finally {
      setPasskeyPending(false);
    }
  };

  // ------------------------------------------------------------------
  // フォールバック: ユーザー名+パスワード → パスキー自動登録
  // ------------------------------------------------------------------
  const handleFallbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFallbackPending(true);
    setPasskeyError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const userName = (formData.get('userName') ?? '') as string;
    const password = (formData.get('password') ?? '') as string;

    const result = await loginAndRegisterPasskey(userName, password);
    if (result.error) {
      // パスキー作成に失敗。セッションは一切作成されていないのでログアウト処理は不要
      setPasskeyError(result.error);
      setFallbackPending(false);
      return;
    }

    // 成功 → リダイレクト（セッションはサーバー側で設定済み）
    window.location.href = '/';
  };

  const handleBackToNormal = () => {
    setPasskeyFallback(false);
    setPasskeyError(null);
  };

  // ------------------------------------------------------------------
  // フォールバックモード
  // ------------------------------------------------------------------
  if (passkeyFallback) {
    return (
      <form onSubmit={handleFallbackSubmit} className="space-y-5">
        {passkeyError && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
            {passkeyError}
          </div>
        )}

        <p className="text-sm text-stone-500 leading-relaxed">
          お使いのデバイスにパスキーが見つかりませんでした。
          <br />
          アカウント情報を入力してログインし、パスキーを登録します。
        </p>

        {/* ユーザー名 */}
        <div className="space-y-1">
          <label htmlFor="fallback-userName" className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            User Name
          </label>
          <input
            id="fallback-userName"
            name="userName"
            type="text"
            required
            minLength={3}
            maxLength={32}
            value={normalUserName}
            onChange={(e) => setNormalUserName(e.target.value)}
            placeholder="ユーザーネームを入力"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
          />
        </div>

        {/* パスワード */}
        <div className="space-y-1">
          <label htmlFor="fallback-password" className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Password
          </label>
          <input
            id="fallback-password"
            name="password"
            type="password"
            required
            minLength={8}
            value={normalPassword}
            onChange={(e) => setNormalPassword(e.target.value)}
            placeholder="パスワードを入力"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
          />
        </div>

        <button
          type="submit"
          disabled={fallbackPending}
          className="w-full py-3.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-amber-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {fallbackPending ? 'ログイン中...' : 'ログインしてパスキーを登録'}
        </button>

        <button
          type="button"
          onClick={handleBackToNormal}
          className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors text-center"
        >
          ← 戻る
        </button>
      </form>
    );
  }

  // ------------------------------------------------------------------
  // 通常モード
  // ------------------------------------------------------------------
  return (
    <form action={formAction} className="space-y-5">
      {/* エラー表示 */}
      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {state.error}
        </div>
      )}

      {/* ユーザー名 */}
      <div className="space-y-1">
        <label htmlFor="userName" className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
          User Name
        </label>
        <input
          id="userName"
          name="userName"
          type="text"
          required
          value={normalUserName}
          onChange={(e) => setNormalUserName(e.target.value)}
          placeholder="ユーザーネームを入力"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
        />
      </div>

      {/* パスワード */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Password
          </label>
          <a href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 hidden">パスワードをお忘れですか？</a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={normalPassword}
          onChange={(e) => setNormalPassword(e.target.value)}
          placeholder="パスワードを入力"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
        />
      </div>

      {/* パスキーエラーの表示 */}
      {passkeyError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {passkeyError}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-stone-900/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isPending ? '認証中...' : 'ログイン'}
      </button>

      {/* 区切り線 */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-stone-400 font-bold">または</span>
        </div>
      </div>

      {/* パスキーログインボタン */}
      <button
        type="button"
        onClick={handlePasskeyLogin}
        disabled={passkeyPending}
        className="w-full py-3.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-amber-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        {passkeyPending ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>パスキー認証中...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>パスキーでログイン</span>
          </>
        )}
      </button>
    </form>
  );
}
