'use client';

import React from 'react';
import Link from 'next/link';
import { Search, FilePlus, Settings, Shield } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useWithSession } from '@/client/lib/useWithSession';

interface HeaderMobileMenuProps {
  isOpen: boolean;
  searchQuery: string;
  userRole?: string | null;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onNavClick: () => void;
}

/**
 * ヘッダーのモバイルメニュー
 * 検索フォーム + ナビゲーションリンクを含む
 */
export function HeaderMobileMenu({
  isOpen,
  searchQuery,
  userRole,
  onSearchChange,
  onSearchSubmit,
  onNavClick,
}: HeaderMobileMenuProps) {
  const searchParams = useSearchParams();
  const isLoginParam = searchParams.get('login') === 'true';
  const hasEditSession = searchParams.has('session') || searchParams.has('edit');

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';
  const showLogin = !userRole && isLoginParam;
  const withSession = useWithSession();

  return (
    <div className={`sm:hidden overflow-hidden transition-[max-height,padding] duration-300 ${isOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'}`}>
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 space-y-3">
        <form onSubmit={onSearchSubmit} className="w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-stone-200 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800 disabled:opacity-50"
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        <div className="grid gap-2">
          <Link
            href={withSession('/')}
            onClick={onNavClick}
            className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
          >
            メインページ
          </Link>
          <Link
            href={withSession('/posts')}
            onClick={onNavClick}
            className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
          >
            項目一覧
          </Link>
          {(isAdmin || showLogin) && (
            <div className="space-y-2 border-t border-stone-200 pt-3">
              {isAdmin && (
                <>
                  <Link
                    href={withSession('/admin')}
                    onClick={onNavClick}
                    className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                  >
                    管理画面
                  </Link>
                  {isOwner && (
                    <Link
                      href={withSession('/owner')}
                      onClick={onNavClick}
                      className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                    >
                      オーナー画面
                    </Link>
                  )}
                </>
              )}
              {showLogin && (
                <Link
                  href={withSession('/auth/login')}
                  onClick={onNavClick}
                  className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                >
                  ログイン
                </Link>
              )}
            </div>
          )}
          {(isAdmin || hasEditSession) && (
            <Link
              href={withSession('/posts/create')}
              onClick={onNavClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
            >
              <FilePlus size={16} /> 項目を作成
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
