'use client';

import { useState, useCallback } from 'react';
import { Eye, Copy, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export function DetailModal({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

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

      <Modal isOpen={open} onClose={close} title={title}>
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-all">{content}</p>
          <CopyButton content={content} />
        </div>
      </Modal>
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
