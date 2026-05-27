'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Monitor, X, Copy, Check } from 'lucide-react';
import { CopyableCell } from '@/components/ui/CopyableCell';

export function DeviceInfoModal({
  ip,
  browser,
}: {
  ip: string;
  browser: string;
}) {
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
        <Monitor className="w-3.5 h-3.5" />
        <span className="ml-1">端末</span>
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
            <div className="card-body space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-stone-900 text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-stone-400" />
                  デバイス情報
                </h3>
                <button
                  onClick={close}
                  className="btn-ghost btn-sm"
                  style={{ padding: '0.25rem' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-stone-400 mb-1.5">IPアドレス</p>
                  <CopyableCell text={ip} mono />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 mb-1.5">ブラウザ</p>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-stone-700 leading-relaxed break-all flex-1 min-w-0">{browser}</span>
                    <CopyButton content={browser} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
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
