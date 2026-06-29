'use client';

import { Database } from 'lucide-react';

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex items-center gap-2 bg-white text-stone-700 font-bold px-6 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 transition-colors text-sm"
    >
      <Database className="w-4 h-4" />
      再接続を試みる
    </button>
  );
}
