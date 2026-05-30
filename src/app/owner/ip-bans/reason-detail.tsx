'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Eye, X, Copy, Check } from 'lucide-react';

export function DetailModal({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost btn-sm"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="ml-1">詳細</span>
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={close}
        >
          <div
            className="w-full max-w-md animate-float-in card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-stone-900 text-lg">{title}</h3>
                <button
                  onClick={close}
                  className="btn-ghost btn-sm"
                  style={{ padding: '0.25rem' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-all">{content}</p>
              <CopyButton content={content} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [content]);

  return (
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
  );
}
