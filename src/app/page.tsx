import React from 'react';
import Link from 'next/link';
import { TrendingUp, Award, ChevronRight } from 'lucide-react';
import { TyokoreIcon } from '../components/icons/TyokoreIcon';
import { searchVisibleContentList, getWeeklyPopularContentList } from '@/server/services/contentService';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { PopularRankingBoard } from '@/components/features/home/PopularRankingBoard';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';

export default async function HomePage() {
  // 本番データ取得 (最新3件を急上昇記事代わりに表示)
  const { posts } = await searchVisibleContentList('', false);
  const recentPosts = posts.slice(0, 3);
  const featuredPost = posts.length > 0 ? posts[0] : null;

  // ランキング取得
  const { posts: allTimePosts } = await searchVisibleContentList('', false, 'viewCount', 'desc', 1, 6);
  const weeklyPosts = await getWeeklyPopularContentList(6);

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');


  return (
    <>
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8 animate-in fade-in duration-500">
        {/* ウェルカムバナー */}
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 md:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-[2.2rem] font-black text-stone-800 mb-3 tracking-tighter">ちょこちょこ大百科へようこそ！</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Mirrativ配信者「ちょこれ」とそのリスナーの公式コミュニティサイトです。
            </p>
            <div className="flex gap-3">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                公開済み {posts.length} 記事
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 bg-stone-100 rounded-full flex items-center justify-center border-[6px] md:border-8 border-white shadow-sm overflow-hidden transform hover:scale-110 transition-transform duration-500">
              <TyokoreIcon className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-stone-100 rounded-full opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* 最新記事リスト (急上昇モックを本番データに置換) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-stone-800 font-black text-xl px-2">
              <TrendingUp size={24} className="text-orange-500" /> 最新の記事
            </div>
            <div className="space-y-3">
              {recentPosts.length === 0 ? (
                <p className="text-stone-500 p-4 border border-stone-200 rounded-2xl bg-stone-50">まだ公開されている記事が存在しません。</p>
              ) : (
                  recentPosts.map((article, index) => {
                    const config = [
                      { color: 'text-amber-500', glow: 'bg-amber-100/50' },
                      { color: 'text-pink-500', glow: 'bg-pink-100/50' },
                      { color: 'text-indigo-500', glow: 'bg-indigo-100/50' },
                    ][index] || { color: 'text-stone-500', glow: 'bg-stone-100/50' };

                    return (
                      <Link 
                        href={`/posts/${article.slug}`} 
                        key={article.id} 
                        className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-stone-100 rounded-[2rem] p-3 md:p-4 flex items-center gap-4 md:gap-6 hover:shadow-2xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
                      >
                        {/* Accent Glow */}
                        <div className={`absolute -left-10 top-1/2 h-32 w-32 rounded-full ${config.glow} blur-3xl opacity-80 transform -translate-y-1/2 group-hover:scale-150 transition-transform duration-700`} />
                        
                        {/* Rank Number */}
                        <div className="relative flex flex-col items-center justify-center min-w-10 md:min-w-12">
                          <span className={`text-2xl md:text-4xl font-black italic transition-colors duration-300 ${config.color.replace('500', '400')} group-hover:${config.color}`}>
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-500 z-10">
                           <img 
                             src={getPublicThumbnailUrl(article.thumbnail) || '/images/no-image.png'} 
                             alt="" 
                             className="w-full h-full object-cover"
                           />
                           <div className={`absolute inset-0 ${config.color.replace('text-', 'bg-')}/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 z-10">
                          <h3 className="font-bold text-stone-800 text-base md:text-lg group-hover:text-blue-600 transition-colors mb-1 truncate">
                            {article.title}
                          </h3>
                          <div className="flex gap-2">
                             <span className="text-[10px] text-stone-400 font-bold uppercase p-1 bg-stone-50 rounded">#{article.slug}</span>
                          </div>
                        </div>

                        {/* Stats & Date (Right Aligned) */}
                        <div className="flex flex-col items-end gap-1 px-2 z-10 text-right">
                          <span className="text-xs text-stone-500 font-bold flex items-center gap-1">
                            <TrendingUp size={14} className={config.color} />
                            {article.viewCount} views
                          </span>
                          <span className="text-[10px] text-stone-300 font-bold">
                            {article.updatedAt instanceof Date ? article.updatedAt.toISOString().split('T')[0] : String(article.updatedAt).split('T')[0]}
                          </span>
                        </div>
                      </Link>
                    );
                  })
              )}
            </div>
          </div>

          {/* Editor's Pick (最新の1件を表示) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-800 font-black text-xl px-2">
              <Award size={24} className="text-amber-500" /> 注目の記事
            </div>
            
            {featuredPost ? (
              <div className="relative overflow-visible">
                <div className="absolute -top-8 left-0 right-0 md:-left-4 md:-right-4 -bottom-4 bg-linear-to-tr from-amber-100/40 to-orange-50/30 rounded-[2rem] -z-10 transform -rotate-4 -translate-y-4" />
                <Link href={`/posts/${featuredPost.slug}`} className="relative z-10 bg-stone-900 rounded-[2.25rem] p-6 md:p-8 text-white overflow-hidden aspect-4/5 flex flex-col justify-end group cursor-pointer shadow-xl shadow-stone-200/20 hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-amber-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest z-20 shadow-sm shadow-amber-400/25">
                    Featured
                  </div>
                  <div className="absolute inset-0 bg-stone-900/40 z-0">
                    <img src={getPublicThumbnailUrl(featuredPost.thumbnail) || '/images/no-image.png'} alt={featuredPost.title} className="w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                  </div>
                  <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl md:text-3xl font-black leading-tight line-clamp-2">{featuredPost.title}</h3>
                    <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:gap-4 transition-all">
                      記事を読む <ChevronRight size={16} />
                    </div>
                  </div>
                  {!featuredPost.thumbnail && (
                    <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                      <TyokoreIcon className="w-64 h-64" />
                    </div>
                  )}
                </Link>
              </div>
            ) : (
               <div className="bg-stone-100 rounded-3xl p-8 aspect-4/5 flex items-center justify-center text-stone-400">
                  記事がありません
               </div>
            )}
          </div>
        </div>

        <PopularRankingBoard 
          weeklyPosts={weeklyPosts} 
          allTimePosts={allTimePosts} 
        />
      </div>

      {/* モバイル限定アクションボタン (FAB: ナビゲーション統合) */}
      <MobileActions 
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
