import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, ChevronRight } from 'lucide-react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
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
 * トップページの注目項目セクション
 * 最新の1件をフィーチャー表示する
 */
export function FeaturedPostSection({ post }: { post: PostSummary | null }) {
  return (
    <div className="lg:col-span-2 space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-2 text-stone-800 font-black text-xl px-2 shrink-0">
        <Award size={24} className="text-amber-500" /> 注目の項目
      </div>

      {post ? (
        <div className="relative overflow-visible flex-1">
          <div className="absolute -top-8 left-0 right-0 md:-left-4 md:-right-4 -bottom-4 bg-linear-to-tr from-amber-100/40 to-orange-50/30 rounded-[2rem] -z-10 transform -rotate-4 -translate-y-4" />
          <Link href={`/posts/${post.slug}`} className="relative z-10 bg-stone-900 rounded-[2.25rem] p-6 md:p-8 text-white overflow-hidden h-full flex flex-col justify-end group cursor-pointer shadow-xl shadow-stone-200/20 hover:-translate-y-1 transition-transform duration-500 min-h-[300px] lg:min-h-0">
            <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-amber-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest z-20 shadow-sm shadow-amber-400/25">
              Featured
            </div>
            <div className="absolute inset-0 z-0 bg-white">
              <Image src={getPublicThumbnailUrl(post.thumbnail) || '/images/no-image.png'} alt={post.title} fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-linear-to-t from-stone-900 via-stone-900/40 to-transparent opacity-80" />
            </div>
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl md:text-3xl font-black leading-tight line-clamp-2">{post.title}</h3>
              <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm group-hover:gap-4 transition-all">
                項目を読む <ChevronRight size={16} />
              </div>
            </div>
            {!post.thumbnail && (
              <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                <TyokoreIcon className="w-64 h-64" />
              </div>
            )}
          </Link>
        </div>
      ) : (
        <div className="bg-stone-100 rounded-3xl p-8 h-full flex items-center justify-center text-stone-400">
          項目がありません
        </div>
      )}
    </div>
  );
}
