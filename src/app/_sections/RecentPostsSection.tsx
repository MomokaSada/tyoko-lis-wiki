import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';

interface PostSummary {
  id: number;
  slug: string;
  title: string;
  thumbnail: string | null;
  viewCount: number;
  updatedAt: Date | string;
  isPublished: boolean;
}

/**
 * トップページの最新項目リストセクション
 * 最新の3件をランキング形式で表示する
 */
export function RecentPostsSection({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center gap-2 text-stone-800 font-black text-xl px-2">
        <TrendingUp size={24} className="text-orange-500" /> 最新の項目
      </div>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-stone-500 p-4 border border-stone-200 rounded-2xl bg-stone-50">
            まだ公開されている項目が存在しません。
          </p>
        ) : (
          posts.map((article, index) => {
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
                <div className={`absolute -left-10 top-1/2 h-32 w-32 rounded-full ${config.glow} blur-3xl opacity-80 transform -translate-y-1/2 group-hover:scale-150 transition-transform duration-700`} />

                <div className="relative flex flex-col items-center justify-center min-w-10 md:min-w-12">
                  <span className={`text-2xl md:text-4xl font-black italic tabular-nums transition-colors duration-300 ${config.color.replace('500', '400')} group-hover:${config.color}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-500 z-10">
                  <Image
                    src={getPublicThumbnailUrl(article.thumbnail) || '/images/no-image.png'}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className={`absolute inset-0 ${config.color.replace('text-', 'bg-')}/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>

                <div className="flex-1 min-w-0 z-10">
                  <h3 className="font-bold text-stone-800 text-base md:text-lg group-hover:text-blue-600 transition-colors mb-1 truncate">
                    {article.title}
                  </h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase p-1 bg-stone-50 rounded">#{article.slug}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 px-2 z-10 text-right">
                  <span className="text-xs text-stone-500 font-bold flex items-center gap-1">
                    <TrendingUp size={14} className={config.color} />
                    {article.viewCount} views
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">
                    {article.updatedAt instanceof Date ? article.updatedAt.toISOString().split('T')[0] : String(article.updatedAt).split('T')[0]}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
