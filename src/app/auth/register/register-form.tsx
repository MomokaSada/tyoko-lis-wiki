'use client';

import { useState, useCallback } from 'react';
import { registerAction } from '@/server/actions/authActions';

const STORAGE_KEY = 'pendingPasskey';

export function RegisterForm({ sessionToken }: { sessionToken: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [wantPasskey, setWantPasskey] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);

    // パスキー作成フラグを sessionStorage に保存してからサーバーアクションを呼ぶ
    if (wantPasskey) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }

    const result = await registerAction({ error: null }, formData);
    if (result.error) {
      // エラー時はフラグを削除
      sessionStorage.removeItem(STORAGE_KEY);
      setError(result.error);
      setPending(false);
      return;
    }

    // 成功時は registerAction 内部で redirect('/') が呼ばれる
    // このコードには到達しない
  }, [wantPasskey]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="session" value={sessionToken} />

      {/* エラー表示 */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {error}
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
          minLength={3}
          maxLength={32}
          placeholder="ユーザー名を入力"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
        />
      </div>

      {/* パスワード */}
      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="パスワードを入力"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
        />
      </div>

      {/* 確認用パスワード */}
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          placeholder="パスワードを再度入力"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
        />
      </div>

      {/* パスキー登録オプション */}
      <label className="flex items-center gap-4 cursor-pointer group select-none">
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            checked={wantPasskey}
            onChange={(e) => setWantPasskey(e.target.checked)}
            className="sr-only"
          />
          {/* トグルトラック */}
          <div
            className={`w-12 h-7 rounded-full transition-colors duration-300 ${
              wantPasskey ? 'bg-amber-500' : 'bg-stone-200'
            }`}
          />
          {/* トグルノブ */}
          <div
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
              wantPasskey ? 'left-6' : 'left-1'
            }`}
          />
        </div>
        <div className="flex flex-col">
          <span
            className={`text-sm font-bold transition-colors duration-300 ${
              wantPasskey ? 'text-amber-700' : 'text-stone-500'
            }`}
          >
            パスキーも登録する
          </span>
          <span
            className={`text-xs transition-colors duration-300 ${
              wantPasskey ? 'text-amber-500' : 'text-stone-400'
            }`}
          >
            生体認証またはPINでログインできるようになります
          </span>
        </div>
      </label>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-stone-900/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {pending ? '作成中...' : 'アカウントを作成する'}
      </button>
    </form>
  );
}
