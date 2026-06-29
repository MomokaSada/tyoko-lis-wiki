'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface CopyableLinkProps {
  url: string;
  className?: string;
}

export function CopyableLink({ url, className = '' }: CopyableLinkProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('URL をクリップボードにコピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [url, showToast]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 max-w-full overflow-hidden text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-blue-400/40 hover:decoration-blue-600/60 transition-all cursor-pointer font-medium text-left ${className}`}
      title="クリックでリンクをコピー"
    >
      <span className="truncate min-w-0">{url}</span>
      {copied ? (
        <Check size={14} className="shrink-0 text-green-500" />
      ) : (
        <Copy size={14} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
