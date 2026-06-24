import React, { Suspense } from 'react';
import { Library } from 'lucide-react';
import { DeleteNotification } from './DeleteNotification';
import { PostSearchControl } from './PostSearchControl';
import { PrivacyToggle } from './PrivacyToggle';
import type {
    ContentSortKey,
    SortOrder,
} from '@/server/types/repositoryTypes';

interface PostsHeroSectionProps {
  canViewPrivate: boolean;
  showPrivate: boolean;
  query: string;
  sort: string;
  order: string;
  session: string;
}

/**
 * 項目一覧ページのヒーローセクション
 * 検索機能、タイトル、公開/非公開切替を含む
 */
export function PostsHeroSection({
  canViewPrivate,
  showPrivate,
  query,
  sort,
  order,
  session,
}: PostsHeroSectionProps) {
  return (
    <>
      <Suspense fallback={null}>
        <DeleteNotification />
      </Suspense>

      <div className="relative bg-[#0c0c0c] text-white pt-20 md:pt-24 pb-24 md:pb-32 border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-[72rem] mx-auto px-4 sm:px-6">
          {canViewPrivate && (
            <div className="absolute top-0 right-6 z-30 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
              <PrivacyToggle initialShowPrivate={showPrivate} />
            </div>
          )}

          <div className="flex items-center gap-3 mb-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <Library size={20} className="text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Wiki Article</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-10">
            <div className="max-w-xl space-y-3 animate-in slide-in-from-bottom-6 duration-700 delay-100">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none">
                項目一覧
              </h1>
              <p className="text-stone-400 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-lg line-clamp-2 md:line-clamp-none">
                知見を体系化し、次世代へ繋ぐ。投稿されたすべてのナレッジをここで検索、管理することができます。
              </p>
            </div>

            <div className="w-full lg:flex-1 relative z-30 animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <PostSearchControl
                initialQuery={query}
                initialSort={sort as ContentSortKey}
                initialOrder={order as SortOrder}
                session={session}
                showPrivate={showPrivate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
