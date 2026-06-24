import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Calendar, ArrowRight } from 'lucide-react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { PostPagination } from './PostPagination';
import type {
    ContentSortKey,
    SortOrder,
} from '@/server/types/repositoryTypes';

interface PostSummary {
  id: number;
  slug: string;
  title: string;
  thumbnail: string | null;
  viewCount: number;
  updatedAt: Date | string;
  isPublished: boolean;
}

interface PostCardGridProps {
  posts: PostSummary[];
  canViewPrivate: boolean;
  session: string;
  sort: string;
  order: string;
  showPrivate: boolean;
  categoryId?: number;
  totalPages: number;
  currentPage: number;
}

/**
 * 項目一覧のカードグリッド
 * 各項目のサムネイル、タイトル、統計情報をカード形式で表示する
 */
export function PostCardGrid({
  posts,
  canViewPrivate,
  session,
  sort,
  order,
  showPrivate,
  categoryId,
  totalPages,
  currentPage,
}: PostCardGridProps) {
  const fallbackThumbnail = '/images/no-image.png';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {posts.map((post, idx) => {
          const thumbnailUrl = getPublicThumbnailUrl(post.thumbnail);
          const formattedDate = post.updatedAt instanceof Date
            ? post.updatedAt.toLocaleDateString('ja-JP').replace(/\//g, '-')
            : '不明';

          return (
            <Link
              href={`${`/posts/${post.slug}`}${(() => {
                  const params = new URLSearchParams();
                  if (session) params.set('session', session);
                  if (sort !== 'updatedAt') params.set('sort', sort);
                  if (order !== 'desc') params.set('order', order);
                  if (showPrivate) params.set('showPrivate', '1');
                  if (categoryId) params.set('categoryId', String(categoryId));
                  const qs = params.toString();
                  return qs ? `?${qs}` : '';
                })()
              }`}
              key={post.id}
              className="group bg-white border border-stone-200 hover:border-amber-400 rounded-[2rem] flex flex-col transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 block h-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="relative aspect-[2/1] overflow-hidden bg-stone-100 border-b border-stone-100">
                <Image
                  src={thumbnailUrl || fallbackThumbnail}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {canViewPrivate && !post.isPublished && (
                  <div className="absolute top-4 right-4 bg-[#0c0c0c] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
                    Private / 非公開
                  </div>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <TyokoreIcon className="w-6 h-6 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 break-all line-clamp-1">
                    {post.slug}
                  </span>
                </div>

                <h3 className="text-xl font-black text-stone-900 mb-4 group-hover:text-amber-700 transition-colors leading-tight tracking-tighter line-clamp-2">
                  {post.title}
                </h3>

                <div className="mt-auto pt-6 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-0.5">Views</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                        <Eye className="w-3.5 h-3.5" />
                        {post.viewCount}
                      </div>
                    </div>
                    <div className="w-px h-6 bg-stone-100" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-0.5">Updated</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-all group-hover:rotate-12">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <PostPagination
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </>
  );
}
