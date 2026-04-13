import React from 'react';
import Link from 'next/link';
import { TrendingUp, Award, ChevronRight } from 'lucide-react';
import { TyokoreIcon } from '../components/icons/TyokoreIcon';
import { searchVisibleContentList, getWeeklyPopularContentList } from '@/server/services/contentService';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { PopularRankingBoard } from '@/components/features/home/PopularRankingBoard';

export default async function HomePage() {
  // 本番データ取得 (最新3件を急上昇記事代わりに表示)
  const { posts } = await searchVisibleContentList('', false);
  const recentPosts = posts.slice(0, 3);
  const featuredPost = posts.length > 0 ? posts[0] : null;

  // ランキング取得
  const { posts: allTimePosts } = await searchVisibleContentList('', false, 'viewCount', 'desc', 1, 6);
  const weeklyPosts = await getWeeklyPopularContentList(6);


  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
      {/* ウェルカムバナー */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-black text-stone-800 mb-4 tracking-tighter">ちょこちょこ大百科へようこそ！</h2>
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
          <div className="w-48 h-48 bg-stone-100 rounded-full flex items-center justify-center border-8 border-white shadow-sm overflow-hidden transform hover:scale-110 transition-transform duration-500">
            <TyokoreIcon className="w-32 h-32" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-stone-100 rounded-full opacity-50"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 最新記事リスト (急上昇モックを本番データに置換) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-black text-xl px-2">
            <TrendingUp size={24} className="text-orange-500" /> 最新の記事
          </div>
          <div className="space-y-3">
            {recentPosts.length === 0 ? (
               <p className="text-stone-500 p-4 border border-stone-200 rounded-2xl bg-stone-50">まだ公開されている記事が存在しません。</p>
            ) : (
                recentPosts.map((article, index) => (
                  <Link href={`/posts/${article.slug}`} key={article.id} className="relative overflow-hidden bg-white border border-stone-100 rounded-[2rem] p-5 flex items-center gap-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <div className="absolute -left-10 top-1/2 h-32 w-32 rounded-full bg-orange-100/40 blur-3xl opacity-80 transform -translate-y-1/2" />
                  <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full bg-amber-100/30 blur-3xl opacity-70 pointer-events-none" />
                  <span className="relative text-4xl font-black text-stone-300 group-hover:text-amber-500 transition-colors italic w-12">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="relative font-bold text-stone-800 text-lg group-hover:text-blue-600 transition-colors mb-2">{article.title}</h3>
                    <div className="flex gap-2">
                       <span className="text-[10px] text-stone-400 font-bold uppercase p-1 bg-stone-50 rounded">#{article.slug}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-end gap-1">
                    <span className="text-xs text-stone-500 font-bold flex items-center justify-end gap-1">
                      <TrendingUp size={14} className={index < 3 ? 'text-amber-500' : 'text-stone-300'} />
                      {article.viewCount} views
                    </span>
                    <span className="text-[10px] text-stone-300 font-bold">{article.updatedAt instanceof Date ? article.updatedAt.toISOString().split('T')[0] : String(article.updatedAt).split('T')[0]}</span>
                  </div>
                </Link>
                ))
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
              <div className="absolute -top-8 -left-4 -right-4 -bottom-4 bg-gradient-to-tr from-amber-100/40 to-orange-50/30 rounded-[2rem] -z-10 transform -rotate-4 -translate-y-4" />
              <Link href={`/posts/${featuredPost.slug}`} className="relative block z-10 bg-stone-900 rounded-[2.5rem] p-8 text-white overflow-hidden aspect-[4/5] flex flex-col justify-end group cursor-pointer shadow-xl shadow-stone-200/20 hover:-translate-y-1 transition-transform duration-500">
                <div className="absolute top-8 left-8 bg-amber-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest z-20 shadow-sm shadow-amber-400/25">
                  Featured
                </div>
                <div className="absolute inset-0 bg-stone-900/40 z-0">
                  <img src={getPublicThumbnailUrl(featuredPost.thumbnail) || '/images/no-image.png'} alt={featuredPost.title} className="w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                </div>
                <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-3xl font-black leading-tight line-clamp-2">{featuredPost.title}</h3>
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
             <div className="bg-stone-100 rounded-3xl p-8 aspect-[4/5] flex items-center justify-center text-stone-400">
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
  );
}
