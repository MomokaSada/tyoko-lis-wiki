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
        <label htmlFor="username" className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
          User Name
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="admin"
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
          placeholder="••••••••"
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

      {/* テスト用ヒント (モックでは消してもいいが元のロジック維持のためスタイリングして残す) */}
      <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-500">
        <p className="mb-2 font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span>テスト用アカウント:</p>
        <ul className="space-y-1 ml-4 list-disc marker:text-stone-300">
          <li><strong>admin</strong> / password123 (Admin)</li>
          <li><strong>owner</strong> / password123 (Owner)</li>
          <li><strong>user</strong> / password123 (一般)</li>
        </ul>
      </div>
    </form>
  );
}
