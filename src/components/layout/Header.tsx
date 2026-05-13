"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, FilePlus, Settings, Shield, Menu } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';

interface HeaderProps {
  userRole?: string | null;
}

export const Header = ({ userRole }: HeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoginParam = searchParams.get('login') === 'true';
  const hasEditSession = searchParams.has('session') || searchParams.has('edit');

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';
  const showLogin = !userRole && isLoginParam;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/posts?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="border-b border-stone-100 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4 relative">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
            <TyokoreIcon className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tighter text-stone-900 uppercase">ちょこちょこ大百科</h1>
        </Link>

        <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-100 p-1.5 rounded-2xl gap-1 border border-stone-200/50 items-center whitespace-nowrap">
          <Link href="/" className="px-5 py-2 text-sm font-black rounded-xl transition-all text-stone-500 hover:text-stone-800 focus:bg-white focus:text-stone-900 focus:shadow-sm">
            メインページ
          </Link>
          <Link href="/posts" className="px-5 py-2 text-sm font-black rounded-xl transition-all text-stone-500 hover:text-stone-800 focus:bg-white focus:text-stone-900 focus:shadow-sm">
            記事一覧
          </Link>

          {(isAdmin || showLogin) && (
            <>
              <div className="w-[1px] h-4 bg-stone-300 my-auto mx-1"></div>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded-xl transition-all"
                    >
                      <Settings size={14} />
                      <span>管理画面</span>
                    </Link>
                    {isOwner && (
                      <Link
                        href="/owner"
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded-xl transition-all"
                      >
                        <Shield size={14} />
                        <span>オーナー画面</span>
                      </Link>
                    )}
                  </>
                )}
                {showLogin && (
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded-xl transition-all"
                  >
                    ログイン
                  </Link>
                )}
              </div>
            </>
          )}

          {(isAdmin || hasEditSession) && (
            <>
              <div className="w-[1px] h-4 bg-stone-300 my-auto mx-1"></div>
              <Link
                href="/posts/create"
                className="px-6 py-2 text-sm font-black rounded-xl transition-all text-amber-700 hover:bg-white flex items-center gap-2 shadow-sm bg-amber-50/30"
              >
                <FilePlus size={16} /> 記事を作成
              </Link>
            </>
          )}
        </nav>

        <div className="flex-1 flex items-center justify-end gap-3">
          <form onSubmit={handleSearch} className="hidden lg:block w-full max-w-[160px] lg:max-w-[220px] relative group">
            <input
              type="text"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            href="/posts"
            className="flex lg:hidden items-center justify-center rounded-2xl border border-stone-200 bg-white px-3 py-2 text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <Search size={20} />
          </Link>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className={`sm:hidden overflow-hidden transition-[max-height,padding] duration-300 ${mobileOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'}`}>
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 space-y-3">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              href="/"
              onClick={closeMobileMenu}
              className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
            >
              メインページ
            </Link>
            <Link
              href="/posts"
              onClick={closeMobileMenu}
              className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
            >
              記事一覧
            </Link>
            {(isAdmin || showLogin) && (
              <div className="space-y-2 border-t border-stone-200 pt-3">
                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                    >
                      管理画面
                    </Link>
                    {isOwner && (
                      <Link
                        href="/owner"
                        onClick={closeMobileMenu}
                        className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                      >
                        オーナー画面
                      </Link>
                    )}
                  </>
                )}
                {showLogin && (
                  <Link
                    href="/auth/login"
                    onClick={closeMobileMenu}
                    className="block rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
                  >
                    ログイン
                  </Link>
                )}
              </div>
            )}
            {(isAdmin || hasEditSession) && (
              <Link
                href="/posts/create"
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
              >
                <FilePlus size={16} /> 記事を作成
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
