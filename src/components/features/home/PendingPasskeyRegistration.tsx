'use client';

import { useEffect, useState } from 'react';
import { registerPasskey } from '@/lib/passkey/client';

const STORAGE_KEY = 'pendingPasskey';

/**
 * 登録完了後に sessionStorage のフラグを見てパスキー登録を試行する。
 * 成功・失敗にかかわらずフラグは削除される。
 * 失敗した場合はユーザーに通知し、ログインページなどで再試行できることを伝える。
 */
export function PendingPasskeyRegistration() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const flag = sessionStorage.getItem(STORAGE_KEY);
    if (flag !== 'true') return;

    sessionStorage.removeItem(STORAGE_KEY);

    registerPasskey().then((result) => {
      if (result.error) {
        setMessage(`パスキーの登録に失敗しました: ${result.error}。ログインページから再試行できます。`);
      } else {
        setMessage('パスキーを登録しました！');
      }
    });
  }, []);

  if (!message) return null;

  const isError = message.includes('失敗');
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold transition-all animate-in slide-in-from-bottom-4 fade-in duration-300 ${
        isError
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
      }`}
    >
      {message}
    </div>
  );
}
