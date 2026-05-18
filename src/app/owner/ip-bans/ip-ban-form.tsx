'use client';

import { useActionState } from 'react';
import {
  createIpBanAction,
  type CreateIpBanActionState,
} from '@/server/actions/ipBanActions';

const initialState: CreateIpBanActionState = {
  error: null,
  bannedIp: null,
  reason: null,
};

export function IpBanForm() {
  const [state, action, isPending] = useActionState(createIpBanAction, initialState);

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="ip" className="text-sm font-black text-stone-700 uppercase tracking-wider block px-1">
            IPアドレス
          </label>
          <input
            id="ip"
            name="ip"
            type="text"
            placeholder="127.0.0.1"
            required
            className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-mono font-bold text-stone-900 text-lg"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="browser" className="text-sm font-black text-stone-700 uppercase tracking-wider block px-1">
            ブラウザ情報
          </label>
          <input
            id="browser"
            name="browser"
            type="text"
            placeholder="Chrome / manual"
            required
            defaultValue="manual"
            className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="reason" className="text-sm font-black text-stone-700 uppercase tracking-wider block px-1">
            BAN理由
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            placeholder="BANする理由を詳細に記入してください"
            required
            className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 hover:-translate-y-1 transition-all shadow-xl shadow-red-600/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isPending ? '登録中...' : 'IPをBANする'}
        </button>
      </form>

      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 font-bold animate-in shake duration-300">
          {state.error}
        </div>
      )}

      {state.bannedIp && (
        <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 rounded-full bg-red-500" />
            <h3 className="font-black text-red-900 text-lg">BANが完了しました</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm flex items-center justify-between">
              <span className="font-bold text-stone-500 text-sm">BAN済みIP</span>
              <span className="font-mono font-black text-stone-900">{state.bannedIp}</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm flex items-start justify-between gap-4">
              <span className="font-bold text-stone-500 text-sm">理由</span>
              <span className="text-stone-900 font-medium text-sm text-right">{state.reason}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
