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
    <div className="space-y-6">
      <form action={action} className="space-y-4 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="ip" className="text-sm font-bold text-stone-700 uppercase tracking-wider block">
            IPアドレス
          </label>
          <input
            id="ip"
            name="ip"
            type="text"
            placeholder="127.0.0.1"
            required
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900 font-mono"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="browser" className="text-sm font-bold text-stone-700 uppercase tracking-wider block">
            ブラウザ
          </label>
          <input
            id="browser"
            name="browser"
            type="text"
            placeholder="Chrome / manual"
            required
            defaultValue="manual"
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-bold text-stone-700 uppercase tracking-wider block">
            BAN理由
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            placeholder="BANする理由を詳細に記入してください"
            required
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium text-stone-900 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-red-600/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? '登録中...' : 'IPをBANする'}
        </button>
      </form>

      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {state.error}
        </div>
      )}

      {state.bannedIp && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <h3 className="font-bold text-red-800">BANが完了しました</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <span className="font-medium text-stone-600">BAN済みIP:</span>
              <span className="ml-2 font-mono text-stone-900">{state.bannedIp}</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <span className="font-medium text-stone-600">理由:</span>
              <span className="ml-2 text-stone-900">{state.reason}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
