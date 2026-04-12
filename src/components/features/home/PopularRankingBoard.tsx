import React from 'react';
import Link from 'next/link';
import { Award, TrendingUp, ChevronRight, BookOpen } from 'lucide-react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';

interface RankingPost {
  id: number;
  slug: string;
  title: string;
  viewCount: number;
  updatedAt: Date;
  thumbnail?: string | null;
}

interface PopularRankingBoardProps {
  weeklyPosts: RankingPost[];
  allTimePosts: RankingPost[];
}

export function PopularRankingBoard({ weeklyPosts, allTimePosts }: PopularRankingBoardProps) {
  const displayWeekly = weeklyPosts.slice(0, 3);
  const featuredAllTime = allTimePosts.length > 0 ? allTimePosts[0] : null;

  return (
    <div className="py-20 border-t border-stone-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        {/* 左側: 歴代トップ (フィーチャーカード) - 幅広にして左に配置 */}
        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1 relative">
          <div className="flex items-center gap-2 text-stone-800 font-black text-2xl px-2">
            <Award size={28} className="text-amber-500" /> 歴代トップ
          </div>
          
          {featuredAllTime ? (
            <div className="relative overflow-visible">
              <div className="absolute -top-16 -left-4 -right-4 -bottom-4 bg-gradient-to-tr from-amber-100/50 to-orange-50/50 rounded-[3rem] -z-10 transform -rotate-6 -translate-y-8" />
              <Link href={`/posts/${featuredAllTime.slug}`} className="relative block z-10 bg-stone-900 rounded-[2.5rem] p-8 text-white overflow-hidden aspect-[3/4] flex flex-col justify-end group cursor-pointer shadow-2xl shadow-stone-200/50 hover:-translate-y-2 transition-transform duration-500">
                <div className="absolute top-8 left-8 bg-amber-400 text-stone-900 text-xs font-black px-3 py-1 rounded shadow-sm shadow-amber-400/20 uppercase tracking-widest z-20">
                  All Time Rank 1
                </div>
              <div className="absolute inset-0 bg-stone-900/30 z-0 group-hover:bg-stone-900/10 transition-colors duration-700">
                <img src={getPublicThumbnailUrl(featuredAllTime.thumbnail) || '/images/no-image.png'} alt="thumbnail" className="w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="relative z-10 space-y-5">
                <h3 className="text-3xl lg:text-4xl font-black leading-tight line-clamp-3">{featuredAllTime.title}</h3>
                <div className="flex items-center justify-between border-t border-stone-700/50 pt-5">
                  <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:gap-4 transition-all">
                    記事を読む <ChevronRight size={16} />
                  </div>
                  <span className="text-sm font-black flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <TrendingUp size={16} className="text-amber-400" /> {featuredAllTime.viewCount} views
                  </span>
                </div>
              </div>
              {!featuredAllTime.thumbnail && (
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                  <TyokoreIcon className="w-80 h-80" />
                </div>
              )}
            </Link>
            </div>
          ) : (
             <div className="bg-stone-100 rounded-3xl p-8 aspect-[3/4] flex items-center justify-center text-stone-400">
                記事がありません
             </div>
          )}
        </div>

        {/* 右側: 週間人気記事 (リスト) - あえてリストをずらす */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
          <div className="flex items-center gap-2 text-stone-800 font-black text-2xl px-2 pl-4 lg:pl-12">
            <TrendingUp size={28} className="text-orange-500" /> 今週の人気記事
          </div>
          
          <div className="space-y-4">
            {displayWeekly.length === 0 ? (
               <p className="text-stone-500 p-4 border border-stone-200 rounded-2xl bg-stone-50 ml-12">
                 まだランクインしている記事が存在しません。
               </p>
            ) : (
              displayWeekly.map((article, index) => (
                <Link 
                  href={`/posts/${article.slug}`} 
                  key={article.id} 
                  className={`bg-white border hover:border-transparent rounded-3xl p-5 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden
                    ${
                      index === 0 ? 'ml-0 lg:-ml-6 border-amber-100 z-30' :
                      index === 1 ? 'ml-0 lg:ml-6 border-stone-100 z-20' :
                      'ml-0 lg:ml-16 border-stone-100 z-10'
                    }`}
                >
                  <span className={`text-4xl font-black italic w-12 transition-colors ${
                    index === 0 ? 'text-amber-400 group-hover:text-amber-500' :
                    index === 1 ? 'text-stone-300 group-hover:text-stone-400' :
                    index === 2 ? 'text-orange-300 group-hover:text-orange-400' :
                    'text-stone-200 group-hover:text-stone-300'
                  }`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 text-lg group-hover:text-blue-600 transition-colors mb-2">
                      {article.title}
                    </h3>
                    <div className="flex gap-2">
                       <span className="text-[10px] text-stone-400 font-bold uppercase p-1 bg-stone-50 rounded">
                         #{article.slug}
                       </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-end gap-1">
                    <span className="text-xs text-stone-500 font-bold flex items-center justify-end gap-1">
                      <TrendingUp size={14} className={index < 3 ? 'text-amber-500' : 'text-stone-300'} />
                      {article.viewCount} views
                    </span>
                    <span className="text-[10px] text-stone-300 font-bold">
                      {new Date(article.updatedAt).toISOString().split('T')[0]}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="mt-16 text-center bg-stone-900 rounded-[3rem] p-10 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-stone-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-white mb-4">もっと記事を探してみませんか？</h3>
          <p className="text-stone-400 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
            ランキング以外にも、過去の配信の記録や名言など、ここでは紹介しきれない様々なコンテンツが眠っています。
          </p>
          <Link href="/posts" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-4 rounded-full transition-all hover:shadow-lg hover:-translate-y-1 shadow-amber-500/20 text-sm">
            <BookOpen size={18} />
            すべての記事を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
