'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyableCell({
  text,
  mono = false,
}: {
  text: string;
  className?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select-less copy not supported
    }
  }, [text]);

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`text-sm font-bold text-stone-800 ${mono ? 'font-mono' : ''}`}>{text}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors shrink-0"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600">コピー完了</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>コピー</span>
          </>
        )}
      </button>
    </div>
  );
}
