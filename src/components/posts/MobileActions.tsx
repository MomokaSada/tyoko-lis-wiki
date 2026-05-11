'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu, X, BookOpen, User, Share2, Home, List,
  FilePlus, Settings, Shield, Compass, Check, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArticleProfile, ArticleProfileProps } from './ArticleProfile';
import TableOfContents from './TableOfContents';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface MobileActionsProps {
  toc?: TocItem[];
  postTitle?: string;
  userRole?: string | null;
  hasEditSession?: boolean;
  hideShare?: boolean;
  hideProfile?: boolean;
  articleProfileProps?: ArticleProfileProps;
}

export function MobileActions({
  toc,
  postTitle,
  userRole,
  hasEditSession,
  hideShare = false,
  hideProfile = false,
  articleProfileProps
}: MobileActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'nav' | 'toc' | 'profile'>('nav');
  const [isCopied, setIsCopied] = useState(false);

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isOwner = userRole === 'owner';

  const searchParams = useSearchParams();
  const isLoginParam = searchParams.get('login') === 'true';
  const showLogin = !userRole && isLoginParam;

  // 背景クリックで閉じる処理
  useEffect(() => {
    if (activeTab !== 'none' || isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeTab, isOpen]);

  const closeAll = () => {
    setIsOpen(false);
    setActiveTab('nav');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab('none');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={closeAll}
        />
      )}

      {/* ポップアップコンテンツ (ボトムシート風) */}
      <div className={`fixed inset-x-4 bottom-24 z-[110] transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}>
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-stone-100 max-h-[70vh] flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              {activeTab !== 'nav' && (
                <button
                  onClick={() => setActiveTab('nav')}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors mr-1"
                >
                  <ChevronLeft size={20} className="text-stone-600" />
                </button>
              )}
              <h3 className="font-black text-stone-900">
                {activeTab === 'toc' && '目次'}
                {activeTab === 'profile' && 'プロフィール'}
                {activeTab === 'nav' && 'メニュー'}
              </h3>
            </div>
            <button onClick={closeAll} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className={`${activeTab === 'profile' ? 'p-0' : 'p-6'} overflow-y-auto flex-1 overscroll-contain`}>
            {activeTab === 'toc' && (
              <div className="space-y-1">
                {toc && toc.length > 0 ? (
                  <TableOfContents toc={toc} isMobile={true} />
                ) : (
                  <p className="text-stone-400 text-center py-8">目次がありません</p>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="w-full">
                {articleProfileProps ? (
                  <ArticleProfile {...articleProfileProps} isMobile={true} />
                ) : (
                  <div className="p-8 text-center text-stone-400">プロファイル情報がありません</div>
                )}
              </div>
            )}

            {activeTab === 'nav' && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Link href="/" onClick={closeAll} className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-100 transition">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Home size={20} className="text-stone-500" />
                    </div>
                    メインページ
                  </Link>
                  <Link href="/posts" onClick={closeAll} className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-100 transition">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <List size={20} className="text-stone-500" />
                    </div>
                    記事一覧
                  </Link>

                  {(isAdmin || hasEditSession) && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {isAdmin && (
                        <>
                          <Link href="/admin" onClick={closeAll} className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-[13px] font-bold text-stone-600 transition">
                            <Settings size={16} /> 管理画面
                          </Link>
                          {isOwner && (
                            <Link href="/owner" onClick={closeAll} className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-[13px] font-bold text-stone-600 transition">
                              <Shield size={16} /> オーナー画面
                            </Link>
                          )}
                        </>
                      )}
                      <Link href="/posts/create" onClick={closeAll} className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-xl text-[13px] font-black text-amber-700 transition">
                        <FilePlus size={16} /> 記事を作成
                      </Link>
                    </div>
                  )}

                  {showLogin && (
                    <Link href="/auth/login" onClick={closeAll} className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-100 transition">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <User size={20} className="text-stone-500" />
                      </div>
                      ログイン
                    </Link>
                  )}
                </div>

                {/* 記事詳細ページ専用のナビゲーション */}
                {postTitle && (
                  <div className="space-y-4 pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-3 px-1">
                      <Compass size={16} className="text-stone-400" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">記事ナビゲーション</span>
                    </div>
                    <div className="grid gap-3">
                      {toc && toc.length > 0 && (
                        <button
                          onClick={() => setActiveTab('toc')}
                          className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-100 transition text-left"
                        >
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <BookOpen size={20} className="text-stone-500" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">目次</div>
                            <div className="text-[10px] text-stone-400 font-normal">記事の構成を確認</div>
                          </div>
                        </button>
                      )}

                      {!hideProfile && (
                        <button
                          onClick={() => setActiveTab('profile')}
                          className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-100 transition text-left"
                        >
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <User size={20} className="text-stone-500" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">プロフィール</div>
                            <div className="text-[10px] text-stone-400 font-normal">記事情報</div>
                          </div>
                        </button>
                      )}

                      {!hideShare && (
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-100 transition text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center transition-colors ${isCopied ? 'bg-green-500 text-white' : 'bg-white text-stone-500'}`}>
                            {isCopied ? <Check size={20} /> : <Share2 size={20} />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">リンクをコピー</div>
                            <div className="text-[10px] text-stone-400 font-normal">{isCopied ? 'コピーしました！' : 'URLをクリップボードへ'}</div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-3 pointer-events-none lg:hidden">

        {/* メインボタン */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setActiveTab('nav');
          }}
          className={`pointer-events-auto w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-300 transform ${isOpen ? 'bg-stone-800 text-white rotate-0' : 'bg-stone-900 shadow-amber-500/20 text-white'
            } active:scale-90`}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </>
  );
}
