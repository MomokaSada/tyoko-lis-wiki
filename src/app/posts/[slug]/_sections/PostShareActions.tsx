'use client';

import { useState, useEffect } from 'react';
import { Link2, Check } from 'lucide-react';

interface PostShareActionsProps {
  title: string;
}

export function PostShareActions({ title }: PostShareActionsProps) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const shareLinks = {
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    hatena: `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="mt-12 pt-8 border-t border-stone-100">
      <div className="flex flex-col items-center gap-6">
        <p className="text-stone-500 text-sm font-bold tracking-wider">この項目をシェアする</p>

        <div className="flex items-center gap-4">
          <a
            href={shareLinks.x}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-stone-900 text-white hover:opacity-80 transition-opacity shadow-sm"
            aria-label="Xでシェア"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-opacity shadow-sm"
            aria-label="Facebookでシェア"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          <a
            href={shareLinks.hatena}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#00A4DE] text-white hover:opacity-80 transition-opacity shadow-sm"
            aria-label="はてなブックマークに保存"
          >
            <span className="font-black text-lg leading-none" style={{ fontFamily: 'sans-serif' }}>B!</span>
          </a>

          <button
            onClick={handleCopy}
            className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all shadow-sm ${copied
                ? 'bg-green-50 border-green-500 text-green-500'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            aria-label="URLをコピー"
          >
            {copied ? <Check size={20} /> : <Link2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
