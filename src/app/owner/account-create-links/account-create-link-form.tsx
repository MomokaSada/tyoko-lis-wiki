'use client';

import { useActionState } from 'react';
import {
  createAccountCreateLinkAction,
  type CreateAccountCreateLinkActionState,
} from '@/server/actions/accountCreateLinkActions';
import { CopyableLink } from '@/components/ui/CopyableLink';

const initialState: CreateAccountCreateLinkActionState = {
  error: null,
  generatedUrl: null,
  expiresAt: null,
};

export function AccountCreateLinkForm() {
  const [state, action, isPending] = useActionState(
    createAccountCreateLinkAction,
    initialState,
  );

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="expiresInMinutes" className="text-sm font-black text-stone-700 uppercase tracking-wider block px-1">
            有効期限（分）
          </label>
          <input
            id="expiresInMinutes"
            name="expiresInMinutes"
            type="number"
            min={5}
            max={10080}
            defaultValue={60}
            className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-stone-900 text-lg"
          />
          <p className="text-xs text-stone-400 px-1 font-medium">5分～10080分（7日間）で設定可能です</p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-stone-900 text-white font-black rounded-2xl hover:bg-stone-800 hover:-translate-y-1 transition-all shadow-xl shadow-stone-900/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isPending ? '生成中...' : 'リンクを生成する'}
        </button>
      </form>

      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 font-bold animate-in shake duration-300">
          {state.error}
        </div>
      )}

      {state.generatedUrl && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 rounded-full bg-blue-500" />
            <h3 className="font-black text-blue-900 text-lg">生成されたリンク</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm ring-1 ring-blue-50">
            <CopyableLink
              url={`${process.env.NEXT_PUBLIC_APP_URL}${state.generatedUrl}`}
              className="font-mono text-sm text-blue-600 break-all"
            />
          </div>
          <div className="text-sm text-blue-700/70 font-medium flex items-center gap-2">
            <span className="font-bold">有効期限:</span> {state.expiresAt}
          </div>
        </div>
      )}
    </div>
  );
}
