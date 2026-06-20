'use client';

import { useActionState } from 'react';
import { loginAction } from '@/server/actions/authActions';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

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
          placeholder="パスワードを入力"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 bg-stone-900 text-white font-bold rounded-xl mt-4 hover:bg-stone-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-stone-900/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isPending ? '認証中...' : 'ログイン'}
      </button>
    </form>
  );
}
