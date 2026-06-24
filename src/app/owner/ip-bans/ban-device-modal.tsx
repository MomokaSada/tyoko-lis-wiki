'use client';

import { useState, useCallback } from 'react';
import { useActionState } from 'react';
import { createDeviceBanAction } from '@/server/actions/ipBanActions';
import type { BanDeviceFromRecordActionState } from '@/server/actions/ipBanActions';
import { Modal } from '@/components/ui/Modal';

const initialState: BanDeviceFromRecordActionState = {
  error: null,
  bannedIp: null,
  reason: null,
};

export function BanDeviceModal({
  deviceId,
  ip,
  disabled,
}: {
  deviceId: number;
  ip: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createDeviceBanAction, initialState);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (!isPending) {
      setIsOpen(false);
    }
  }, [isPending]);

  // 成功時はモーダルを閉じる
  const isSuccess = state.bannedIp !== null && !state.error;
  if (isSuccess && isOpen) {
    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="ml-1">BANする</span>
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="IP BAN の実行" maxWidth="max-w-md">
        {isSuccess ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-red-800">BAN 完了</span>
            </div>
            <p className="text-sm text-stone-700 mb-1">
              <span className="font-mono font-bold">{state.bannedIp}</span> を BAN しました。
            </p>
            <p className="text-xs text-stone-500">理由: {state.reason}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="deviceId" value={deviceId} />

            {/* 確認表示 */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">BAN対象IP</span>
                <span className="font-mono font-bold text-stone-900 text-sm">{ip}</span>
              </div>
              <p className="text-xs text-stone-400">
                アクセス記録からパブロックを実行します
              </p>
            </div>

            {/* 理由入力 */}
            <div className="space-y-1.5">
              <label htmlFor="ban-reason" className="field-label">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                BAN理由（必須）
              </label>
              <textarea
                id="ban-reason"
                name="reason"
                rows={3}
                placeholder="BANする理由を入力してください"
                required
                className="field-textarea"
              />
            </div>

            {state.error && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-700 font-bold">{state.error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="btn-ghost flex-1 py-3 text-sm font-bold rounded-xl border border-stone-200 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isPending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    BAN中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    BAN を実行する
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
