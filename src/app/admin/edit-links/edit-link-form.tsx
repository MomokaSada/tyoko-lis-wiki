'use client';

import { useActionState } from 'react';
import { createEditLinkAction } from '@/server/actions/editLinkActions';
import type { CreateEditLinkActionState } from '@/server/actions/editLinkActions';
import { formatDateTimeJp } from '@/lib/format/formatDateTime';

const initialState: CreateEditLinkActionState = {
  error: null,
  generatedUrl: null,
  expiresAt: null,
  maxEdits: null,
};

const timePresets = [
  { label: '30分', value: 30 },
  { label: '1時間', value: 60 },
  { label: '24時間', value: 1440 },
  { label: '7日', value: 10080 },
];

const editPresets = [
  { label: '10回', value: 10 },
  { label: '50回', value: 50 },
  { label: '100回', value: 100 },
];

export function EditLinkForm() {
  const [state, action, isPending] = useActionState(createEditLinkAction, initialState);

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div className="flex gap-1.5 mt-2">
              {timePresets.map((tp) => (
                <button
                  key={tp.value}
                  type="button"
                  className={tp.value === 60 ? 'quick-btn-active' : 'quick-btn'}
                  onClick={() => {
                    const input = document.getElementById('expiresInMinutes') as HTMLInputElement;
                    if (input) input.value = String(tp.value);
                  }}
                >
                  {tp.label}
                </button>
              ))}
            </div>
            <p className="input-hint">5〜10080分（最大7日間）</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="maxEdits" className="field-label">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              編集可能回数
            </label>
            <input
              id="maxEdits"
              name="maxEdits"
              type="number"
              min={1}
              max={500}
              defaultValue={50}
              className="field-input"
            />
            <div className="flex gap-1.5 mt-2">
              {editPresets.map((ep) => (
                <button
                  key={ep.value}
                  type="button"
                  className={ep.value === 50 ? 'quick-btn-active' : 'quick-btn'}
                  onClick={() => {
                    const input = document.getElementById('maxEdits') as HTMLInputElement;
                    if (input) input.value = String(ep.value);
                  }}
                >
                  {ep.label}
                </button>
              ))}
            </div>
            <p className="input-hint">1〜500回</p>
          </div>
        </div>

        {/* 設定プレビュー */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-3">設定プレビュー</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 border border-stone-200">
              <p className="text-[10px] text-stone-400 font-bold mb-0.5">有効期限</p>
              <p className="font-bold text-stone-800">60分</p>
              <p className="text-[10px] text-stone-400">→ 期限まで</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-stone-200">
              <p className="text-[10px] text-stone-400 font-bold mb-0.5">編集回数</p>
              <p className="font-bold text-stone-800">50回</p>
              <p className="text-[10px] text-stone-400">の上限</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              生成中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              編集リンクを生成
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

      {isPending && (
        <div className="card-result bg-stone-50 border border-stone-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span className="font-bold text-stone-700">リンクを生成中...</span>
          </div>
        </div>
      )}

      {state.generatedUrl && !isPending && (
        <div className="card-result bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h4 className="font-bold text-emerald-800">編集リンクが生成されました</h4>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-emerald-100">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">生成されたリンク</p>
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
              <div className="bg-white rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">有効期限</p>
                </div>
                <p className="font-bold text-stone-800">{formatDateTimeJp(state.expiresAt)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">編集回数</p>
                </div>
                <p className="font-bold text-stone-800">{state.maxEdits}回</p>
                <p className="text-xs text-stone-500">の上限</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ACTIVE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {formatDateTimeJp(state.expiresAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
