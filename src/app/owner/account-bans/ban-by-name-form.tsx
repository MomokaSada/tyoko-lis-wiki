'use client';

import { useActionState } from 'react';
import { banAccountByNameAction, type BanAccountByNameActionState } from '@/server/actions/accountBanActions';
import { Loader2, UserX } from 'lucide-react';

const initialState: BanAccountByNameActionState = {
  error: null,
  success: null,
};

export function BanByNameForm() {
  const [state, action, isPending] = useActionState(banAccountByNameAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="ban-name" className="field-label">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/><path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/></svg>
            BAN対象アカウント名
          </label>
          <input
            id="ban-name"
            name="name"
            type="text"
            required
            placeholder="ユーザー名を入力"
            className="field-input"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="ban-reason" className="field-label">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            BAN理由
          </label>
          <input
            id="ban-reason"
            name="reason"
            type="text"
            required
            placeholder="BAN理由を入力"
            className="field-input"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-danger"
        style={{
          padding: '0.625rem 1.25rem',
          background: '#ef4444',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.875rem',
          borderRadius: '0.875rem',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px -2px rgba(239, 68, 68, 0.3)',
        }}
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> BAN処理中...</>
        ) : (
          <><UserX className="w-4 h-4" /> BANを実行</>
        )}
      </button>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {state.success}
        </div>
      )}
    </form>
  );
}
