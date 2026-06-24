'use client';

import { useActionState } from 'react';
import { createAccountCreateLinkAction } from '@/server/actions/accountCreateLinkActions';
import type { CreateAccountCreateLinkActionState } from '@/server/actions/accountCreateLinkActions';
import { CopyableLink } from '@/components/ui/CopyableLink';
import { formatDateTimeJp } from '@/lib/format/formatDateTime';

const initialState: CreateAccountCreateLinkActionState = {
  error: null,
  generatedUrl: null,
  expiresAt: null,
};

const quickTimes = [
  { label: '15分', value: 15 },
  { label: '1時間', value: 60 },
  { label: '6時間', value: 360 },
  { label: '24時間', value: 1440 },
  { label: '7日', value: 10080 },
];

export function AccountCreateLinkForm() {
  const [state, action, isPending] = useActionState(
    createAccountCreateLinkAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">

        <div className="space-y-1.5">
          <label htmlFor="expiresInMinutes" className="field-label">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            有効期限（分）
          </label>
          <input
            id="expiresInMinutes"
            name="expiresInMinutes"
            type="number"
            min={5}
            max={10080}
            defaultValue={60}
            className="field-input"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {quickTimes.map((qt) => (
              <button
                key={qt.value}
                type="button"
                className={qt.value === 60 ? 'quick-btn-active' : 'quick-btn'}
                onClick={() => {
                  const input = document.getElementById('expiresInMinutes') as HTMLInputElement;
                  if (input) input.value = String(qt.value);
                }}
              >
                {qt.label}
              </button>
            ))}
          </div>
          <p className="input-hint">5分〜10080分（7日間）で設定できます</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <div className="text-sm text-blue-700 space-y-1">
              <p className="font-bold">アカウント作成リンクについて</p>
              <ul className="text-blue-600 space-y-0.5 list-disc list-inside">
                <li>リンクを知っている anyone がアカウントを作成できます</li>
                <li>有効期限後は自動的に無効化されます</li>
                <li>1つのリンクで1つのアカウントのみ作成可能</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              生成中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              アカウント作成リンクを生成
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

      {state.generatedUrl && (
        <div className="card-result bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h4 className="font-bold text-blue-800">アカウント作成リンクが生成されました</h4>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">生成されたリンク</p>
              <div className="copy-box">
                <code>{`${process.env.NEXT_PUBLIC_APP_URL}${state.generatedUrl}`}</code>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}${state.generatedUrl}`)}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  コピー
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <p className="text-[10px] text-blue-400 font-bold uppercase">有効期限</p>
                </div>
                <p className="font-bold text-stone-800">{formatDateTimeJp(state.expiresAt)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <p className="text-[10px] text-blue-400 font-bold uppercase">発行日時</p>
                </div>
                <p className="font-bold text-stone-800">{formatDateTimeJp(new Date())}</p>
                <p className="text-xs text-stone-500">発行者: owner</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                アクティブ
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                発行者: owner
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
