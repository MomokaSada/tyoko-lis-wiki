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
      <form action={action} className="space-y-6">

        <div className="space-y-1.5">
          <label htmlFor="ip" className="field-label">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            IPアドレス
          </label>
          <input
            id="ip"
            name="ip"
            type="text"
            placeholder="例: 192.168.1.100"
            required
            className="field-input-mono"
          />
          <p className="input-hint">BAN対象のIPアドレスを入力してください</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="browser" className="field-label">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            ブラウザ / 端末情報
          </label>
          <input
            id="browser"
            name="browser"
            type="text"
            placeholder="例: Chrome / Windows"
            defaultValue="manual"
            className="field-input"
          />
          <p className="input-hint">対象のブラウザや端末情報（オプション）</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reason" className="field-label">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            BAN理由
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            placeholder={"BANする理由を詳細に記入してください。\n例：荒らし行為の疑い、サーバーへの負荷かけすぎなど"}
            required
            className="field-textarea"
          />
          <p className="input-hint">必ず具体的な理由を入力してください（監査ログに残ります）</p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div className="text-sm text-red-700 space-y-1">
              <p className="font-bold">この操作について</p>
              <ul className="text-red-600 space-y-0.5 list-disc list-inside">
                <li>指定されたIPからのアクセスが遮断されます</li>
                <li>解除にはOwner権限が必要です</li>
                <li>操作は監査ログに記録されます</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              登録中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              IPをBANする
            </>
          )}
        </button>
      </form>

      {state.error && (
        <div className="card-result bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2.5 mb-2">
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h4 className="font-bold text-amber-800">入力エラー</h4>
          </div>
          <p className="text-sm text-amber-700">{state.error}</p>
        </div>
      )}

      {state.bannedIp && (
        <div className="card-result bg-red-50 border border-red-200">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h4 className="font-bold text-red-800">BANが完了しました</h4>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">BAN済みIP</p>
                  <p className="font-mono font-bold text-stone-900">{state.bannedIp}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-100">
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">理由</p>
              <p className="text-sm text-stone-800">{state.reason}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                BAN中
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
