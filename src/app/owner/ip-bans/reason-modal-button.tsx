'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, X } from 'lucide-react';

export function ReasonModalButton({ reason }: { reason: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-400" />
            BAN理由の詳細
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 text-sm text-stone-700 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
          {reason || '理由の記載はありません。'}
        </div>
        <div className="p-4 border-t border-stone-100 bg-stone-50 text-right">
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        詳細
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
