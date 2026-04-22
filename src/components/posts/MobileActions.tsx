'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu, X, BookOpen, User, Share2, Home, List,
  FilePlus, Settings, Shield, Compass, Check
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
  const [activeTab, setActiveTab] = useState<'none' | 'toc' | 'profile' | 'nav'>('none');
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
    setActiveTab('none');
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
      {(isOpen || activeTab !== 'none') && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={() => {
            setIsOpen(false);
            setActiveTab('none');
          }}
        />
      )}

      {/* ポップアップコンテンツ (ボトムシート風) */}
      <div className={`fixed inset-x-4 bottom-24 z-[110] transition-all duration-300 transform ${activeTab !== 'none' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}>
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-stone-100 max-h-[70vh] flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
            <h3 className="font-black text-stone-900">
              {activeTab === 'toc' && '目次'}
              {activeTab === 'profile' && 'プロフィール'}
              {activeTab === 'nav' && 'メニュー'}
            </h3>
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
                {isAdmin && (
                  <div className="grid gap-2 border-t border-stone-100 pt-3">
                    <Link href="/admin" onClick={closeAll} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 transition">
                      <Settings size={18} /> 管理画面
                    </Link>
                    {isOwner && (
                      <Link href="/owner" onClick={closeAll} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 transition">
                        <Shield size={18} /> オーナー画面
                      </Link>
                    )}
                    {(isAdmin || hasEditSession) && (
                      <Link href="/posts/create" onClick={closeAll} className="flex items-center gap-3 px-4 py-3 text-sm font-black text-amber-600 transition">
                        <FilePlus size={18} /> 記事を作成
                      </Link>
                    )}
                  </div>
                )}
                {showLogin && (
                  <div className="grid gap-2 border-t border-stone-100 pt-3">
                    <Link href="/auth/login" onClick={closeAll} className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-100 transition">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <User size={20} className="text-stone-500" />
                      </div>
                      ログイン
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* フローティングボタン群 */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-3 pointer-events-none lg:hidden">
        {/* サブボタン (展開時) */}
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
          }`}>
          {toc && toc.length > 0 && (
            <button
              onClick={() => activeTab === 'toc' ? closeAll() : setActiveTab('toc')}
              className="flex items-center gap-3 pointer-events-auto group"
            >
              <span className="bg-stone-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg opacity-0 group-active:opacity-100 transition-opacity">目次</span>
              <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-stone-100 text-stone-700 active:bg-amber-100 active:text-amber-700 transition-all">
                <BookOpen size={20} />
              </div>
            </button>
          )}

          {postTitle && !hideProfile && (
            <button
              onClick={() => activeTab === 'profile' ? closeAll() : setActiveTab('profile')}
              className="flex items-center gap-3 pointer-events-auto group"
            >
              <span className="bg-stone-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg opacity-0 group-active:opacity-100 transition-opacity">プロフィール</span>
              <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-stone-100 text-stone-700 active:bg-blue-100 active:text-blue-700 transition-all">
                <User size={20} />
              </div>
            </button>
          )}

          {!hideShare && (
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 pointer-events-auto group"
            >
              <span className="bg-stone-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg opacity-0 group-active:opacity-100 transition-opacity">リンクをコピー</span>
              <div className={`w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border transition-all ${isCopied ? 'bg-green-500 border-green-400 text-white' : 'bg-white border-stone-100 text-stone-700 active:bg-stone-100'
                }`}>
                {isCopied ? <Check size={20} /> : <Share2 size={20} />}
              </div>
            </button>
          )}

          <button
            onClick={() => activeTab === 'nav' ? closeAll() : setActiveTab('nav')}
            className="flex items-center gap-3 pointer-events-auto group"
          >
            <span className="bg-stone-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg opacity-0 group-active:opacity-100 transition-opacity">ナビゲーション</span>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-stone-100 text-stone-700 active:bg-stone-100 transition-all">
              <Compass size={20} />
            </div>
          </button>
        </div>

        {/* メインボタン */}
        <button
          onClick={() => {
            if (isOpen || activeTab !== 'none') {
              closeAll();
            } else {
              setIsOpen(true);
            }
          }}
          className={`pointer-events-auto w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-300 transform ${isOpen || activeTab !== 'none' ? 'bg-stone-800 text-white rotate-0' : 'bg-stone-900 shadow-amber-500/20 text-white'
            } active:scale-90`}
        >
          {isOpen || activeTab !== 'none' ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </>
  );
}
