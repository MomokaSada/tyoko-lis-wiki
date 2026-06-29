'use client';

import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useWithSession } from '@/client/lib/useWithSession';

interface HeaderSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * ヘッダーのデスクトップ検索フォーム
 */
export function HeaderSearch({ searchQuery, onSearchChange, onSearchSubmit }: HeaderSearchProps) {
  const withSession = useWithSession();

  return (
    <div className="flex-1 flex items-center justify-end gap-3">
      <form onSubmit={onSearchSubmit} className="hidden lg:block w-full max-w-[160px] lg:max-w-[220px] relative group">
        <input
          type="text"
          placeholder="検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-stone-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-200 transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-800 transition-colors disabled:opacity-50 hover:text-stone-600"
        >
          <Search size={14} />
        </button>
      </form>

      {/* タブレット/モバイル用の検索ボタン (lg未満で表示) */}
      <Link
        href={withSession('/posts')}
        className="flex lg:hidden items-center justify-center rounded-2xl border border-stone-200 bg-white px-3 py-2 text-stone-700 shadow-sm transition hover:bg-stone-50"
      >
        <Search size={20} />
      </Link>
    </div>
  );
}
