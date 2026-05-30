'use client';

import React from 'react';
import Link from 'next/link';
import { Search, FilePlus, Settings, Shield } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useWithSession } from '@/lib/useWithSession';

interface HeaderNavProps {
  userRole?: string | null;
  onNavClick?: () => void;
}

/**
 * ヘッダーのグローバルナビゲーション
 * メインページ、項目一覧、ロール別リンク、作成導線を含む
 */
export function HeaderNav({ userRole, onNavClick }: HeaderNavProps) {
  const searchParams = useSearchParams();
  const isLoginParam = searchParams.get('login') === 'true';
  const hasEditSession = searchParams.has('session') || searchParams.has('edit');

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';
  const showLogin = !userRole && isLoginParam;
  const withSession = useWithSession();

  return (
    <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-100 p-1.5 rounded-2xl gap-1 border border-stone-200/50 items-center whitespace-nowrap">
      <Link href={withSession('/')} className="px-5 py-2 text-sm font-black rounded-xl transition-all text-stone-500 hover:text-stone-800 focus:bg-white focus:text-stone-900 focus:shadow-sm" onClick={onNavClick}>
        メインページ
      </Link>
      <Link href={withSession('/posts')} className="px-5 py-2 text-sm font-black rounded-xl transition-all text-stone-500 hover:text-stone-800 focus:bg-white focus:text-stone-900 focus:shadow-sm" onClick={onNavClick}>
        項目一覧
      </Link>

      {(isAdmin || showLogin) && (
        <>
          <div className="w-[1px] h-4 bg-stone-300 my-auto mx-1"></div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <Link
                  href={withSession('/admin')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded-xl transition-all"
                  onClick={onNavClick}
                >
                  <Settings size={14} />
                  <span>管理画面</span>
                </Link>
                {isOwner && (
                  <Link
                    href={withSession('/owner')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded-xl transition-all"
                    onClick={onNavClick}
                  >
                    <Shield size={14} />
                    <span>オーナー画面</span>
                  </Link>
                )}
              </>
            )}
            {showLogin && (
              <Link
                href={withSession('/auth/login')}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded-xl transition-all"
                onClick={onNavClick}
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
            href={withSession('/posts/create')}
            className="px-6 py-2 text-sm font-black rounded-xl transition-all text-amber-700 hover:bg-white flex items-center gap-2 shadow-sm bg-amber-50/30"
            onClick={onNavClick}
          >
            <FilePlus size={16} /> 項目を作成
          </Link>
        </>
      )}
    </nav>
  );
}
