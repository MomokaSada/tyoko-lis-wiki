'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyableCell({
  text,
  className = '',
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
    <button
      type="button"
      onClick={handleCopy}
      className={`group relative inline-flex items-center gap-1.5 transition-colors ${className}`}
      title="クリックしてコピー"
    >
      <span className={mono ? 'font-mono' : ''}>{text}</span>
      <span className="shrink-0 w-3.5 h-3.5">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-stone-400" />
        )}
      </span>
      {copied && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 pointer-events-none">
          コピーしました
        </span>
      )}
    </button>
  );
}
