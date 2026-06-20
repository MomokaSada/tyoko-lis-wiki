'use client';

import { useActionState } from 'react';
import { registerAction } from '@/server/actions/authActions';

export function RegisterForm({ sessionToken }: { sessionToken: string }) {
  const [state, formAction, isPending] = useActionState(registerAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="session" value={sessionToken} />

      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {state.error}
        </div>
      )}

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
          placeholder="ユーザー名を入力
          "
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
        />
      </div>

      <div className="space-y-1 hidden">
         {/* モックにはEmailがあったが元のロジックにEmailはなさそう（UserName + Password）なので隠す、あるいはプレースホルダとして残さないか */}
      </div>

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

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 bg-stone-900 text-white font-bold rounded-xl mt-6 hover:bg-stone-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-stone-900/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isPending ? '作成中...' : 'アカウントを作成する'}
      </button>
    </form>
  );
}
