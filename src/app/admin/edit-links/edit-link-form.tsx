'use client';

import { useActionState } from 'react';
import {
  createEditLinkAction,
  type CreateEditLinkActionState,
} from '@/server/actions/editLinkActions';
import { Link2, Loader2 } from 'lucide-react';

const initialState: CreateEditLinkActionState = {
  error: null,
  generatedUrl: null,
  expiresAt: null,
  maxEdits: null,
};

export function EditLinkForm() {
  const [state, action, isPending] = useActionState(createEditLinkAction, initialState);

  return (
    <div className="space-y-4">
      <form action={action} className="grid gap-4 max-w-md">
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-stone-600">有効期限（分）</span>
          <input
            name="expiresInMinutes"
            type="number"
            min={5}
            max={10080}
            defaultValue={60}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <span className="text-[11px] text-stone-400">5〜10080（最大7日）</span>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-stone-600">編集可能回数</span>
          <input
            name="maxEdits"
            type="number"
            min={1}
            max={500}
            defaultValue={50}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <span className="text-[11px] text-stone-400">1〜500</span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed w-fit"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> 生成中...
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" /> 編集リンクを生成
            </>
          )}
        </button>
      </form>

      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      {state.generatedUrl && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
          <div className="text-xs font-bold text-stone-600 mb-2">生成されたリンク</div>
          <div className="font-mono text-xs text-stone-700 break-all">
            {process.env.NEXT_PUBLIC_APP_URL}
            {state.generatedUrl}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
            <div className="rounded-xl bg-white border border-stone-200 px-3 py-2">
              <div className="text-[10px] text-stone-400 font-bold mb-1">有効期限</div>
              <div className="font-bold text-stone-800">{state.expiresAt}</div>
            </div>
            <div className="rounded-xl bg-white border border-stone-200 px-3 py-2">
              <div className="text-[10px] text-stone-400 font-bold mb-1">編集可能回数</div>
              <div className="font-bold text-stone-800">{state.maxEdits}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
