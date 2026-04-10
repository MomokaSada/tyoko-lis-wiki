"use client";

import React from 'react';
import Link from 'next/link';
import { Search, FilePlus, Settings, Shield } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';

interface HeaderProps {
  userRole?: string | null;
}

export const Header = ({ userRole }: HeaderProps) => {
  const searchParams = useSearchParams();
  const isLoginParam = searchParams.get('login') === 'true';
  const hasEditSession = !!searchParams.get('session');
  
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';
  const showLogin = !userRole && isLoginParam;

  return (
    <header className="border-b border-stone-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
            <TyokoreIcon className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-stone-900 uppercase">Tyokore Wiki</h1>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex bg-stone-100 p-1.5 rounded-2xl gap-1 border border-stone-200/50 items-center">
          <Link href="/" className="px-5 py-2 text-sm font-black rounded-xl transition-all text-stone-500 hover:text-stone-800 focus:bg-white focus:text-stone-900 focus:shadow-sm">
            メインページ
          </Link>
          <Link href="/posts" className="px-5 py-2 text-sm font-black rounded-xl transition-all text-stone-500 hover:text-stone-800 focus:bg-white focus:text-stone-900 focus:shadow-sm">
            記事一覧
          </Link>
          
          {/* Admin/Owner/Login Links in Center */}
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

          {/* Create Post Link - Conditional */}
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

        {/* Search Bar Area */}
        <div className="flex-1 flex items-center justify-end">
          <div className="w-full max-w-[180px] lg:max-w-[240px] relative group hidden sm:block">
            <input
              type="text"
              placeholder="検索..."
              className="w-full pl-9 pr-4 py-2 bg-stone-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-200 transition-all outline-none"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};
