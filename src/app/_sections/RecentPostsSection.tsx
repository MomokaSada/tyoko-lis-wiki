import React from 'react';
import Link from 'next/link';
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
 * カード全体にサムネイル背景 + ぼかし + 暗いオーバーレイ
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
              { color: 'text-orange-500/80', glow: 'bg-orange-400/20' },
              { color: 'text-blue-500/80', glow: 'bg-blue-400/15' },
              { color: 'text-rose-500/80', glow: 'bg-rose-400/15' },
            ][index] || { color: 'text-stone-500', glow: 'bg-stone-400/20' };

            const thumbnailUrl = getPublicThumbnailUrl(article.thumbnail);

            return (
              <Link
                href={`/posts/${article.slug}`}
                key={article.id}
                className="relative flex items-stretch rounded-[2rem] overflow-hidden border border-white/10 hover:shadow-2xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
              >
                {/* カード全体の背景画像 */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${thumbnailUrl || '/images/no-image.png'})`,
                  }}
                />
                {/* カード全体の暗いオーバーレイ + ぼかし */}
                <div className="absolute inset-0 backdrop-blur-[10px] bg-black/30" />

                {/* 左: 順位エリア（透明背景・番号はオーバーレイの上に） */}
                <div className="relative flex items-center justify-center w-[100px] shrink-0 z-10">
                  <div
                    className={`absolute left-1/2 top-1/2 h-32 w-32 rounded-full ${config.glow} blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700`}
                  />
                  <span
                    className={`text-2xl md:text-4xl font-black italic tabular-nums transition-colors duration-300 ${config.color}`}
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* 縦の区切り線（白半透明でやわらかく） */}
                <div className="relative w-px bg-white/15 z-10 my-8 md:my-12 shrink-0" />

                {/* 右: コンテンツエリア */}
                <div className="relative flex-1 min-w-0 px-6 py-9 md:px-8 md:py-14 z-10">
                  <h3
                    className="font-bold text-white text-base md:text-lg mb-2 truncate"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    {article.title}
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <span className="text-[10px] text-white/80 font-bold uppercase px-2 py-1 bg-white/15 rounded backdrop-blur-sm">
                      #{article.slug}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-4 text-xs font-bold"
                    style={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                  >
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} className={config.color} />
                      {article.viewCount} views
                    </span>
                    <span>
                      {article.updatedAt instanceof Date
                        ? article.updatedAt.toISOString().split('T')[0]
                        : String(article.updatedAt).split('T')[0]}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
