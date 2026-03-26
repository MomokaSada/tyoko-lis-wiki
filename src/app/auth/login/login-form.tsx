'use client';

import { useActionState } from 'react';
import { loginAction } from '@/server/actions/authActions';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      {/* エラー表示 */}
      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* ユーザー名 */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ユーザー名
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="admin"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                     shadow-sm transition-colors
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* パスワード */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="password123"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                     shadow-sm transition-colors
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
                   shadow-sm transition-all
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'ログイン中...' : 'ログイン'}
      </button>

      {/* テスト用ヒント */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
        <p className="mb-1 font-semibold">テスト用アカウント:</p>
        <ul className="space-y-0.5">
          <li><code>admin</code> / <code>password123</code> (Admin)</li>
          <li><code>owner</code> / <code>password123</code> (Owner)</li>
          <li><code>user</code>  / <code>password123</code> (一般)</li>
        </ul>
      </div>
    </form>
  );
}
