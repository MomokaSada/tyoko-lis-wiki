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
    <div className="space-y-6">
      <form action={action} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <label htmlFor="expiresInMinutes" className="text-sm font-bold text-stone-700 uppercase tracking-wider block">
            有効期限（分）
          </label>
          <input
            id="expiresInMinutes"
            name="expiresInMinutes"
            type="number"
            min={5}
            max={10080}
            defaultValue={60}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
          />
          <p className="text-xs text-stone-500">5分～10080分（7日間）で設定できます</p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-stone-900/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? '生成中...' : 'リンクを生成する'}
        </button>
      </form>

      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {state.error}
        </div>
      )}

      {state.generatedUrl && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <h3 className="font-bold text-green-800">生成されたリンク</h3>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <CopyableLink
              url={`${process.env.NEXT_PUBLIC_APP_URL}${state.generatedUrl}`}
              className="font-mono text-sm"
            />
          </div>
          <div className="text-sm text-stone-600">
            <span className="font-medium">有効期限:</span> {state.expiresAt}
          </div>
        </div>
      )}
    </div>
  );
}
