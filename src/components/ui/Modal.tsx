'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useScrollLock } from '@/lib/useScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useScrollLock(isOpen);

  if (!mounted || !isOpen) return null;

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div
        className={`bg-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <h3 className="text-lg font-black text-stone-900 tracking-tight">
            {title || 'Confirmation'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Backdrop for closing */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );

  // Render at body level to avoid ancestor transform/stacking-context interference
  return createPortal(overlay, document.body);
}
