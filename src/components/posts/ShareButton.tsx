'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  className?: string;
}

export function ShareButton({ title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={className || "p-3 bg-white/10 text-white border border-white/10 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"}
      title="共有"
    >
      {copied ? (
        <>
          <Check size={18} className="text-green-400" />
          <span className="text-xs font-bold text-green-400">コピーしました</span>
        </>
      ) : (
        <Share2 size={18} />
      )}
    </button>
  );
}
