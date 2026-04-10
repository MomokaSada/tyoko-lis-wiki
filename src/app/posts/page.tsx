import { getCurrentActor } from '@/server/lib/currentActor';
import { searchVisibleContentList } from '@/server/services/contentService';
import Link from 'next/link';
import { 
  Eye, 
  AlertCircle, 
  Library, 
  Filter, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { DeleteNotification } from '@/components/features/posts/DeleteNotification';
import { Suspense } from 'react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { PostSearchControl } from '@/components/posts/PostSearchControl';
import { PrivacyToggle } from '@/components/posts/PrivacyToggle';
import { PostPagination } from '@/components/posts/PostPagination';
import type { ContentSortKey, SortOrder } from '@/server/repositories/contentRepository';

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const pageSize = 12;
  const page = typeof sp.page === 'string' ? Math.max(1, parseInt(sp.page)) : 1;
  const query = typeof sp.q === 'string' ? sp.q : '';
  const session = typeof sp.session === 'string' ? sp.session : '';
  const sort = typeof sp.sort === 'string' ? sp.sort as ContentSortKey : 'updatedAt';
  const order = typeof sp.order === 'string' ? sp.order as SortOrder : 'desc';
  
  const actor = await getCurrentActor();
  const canViewPrivate = Boolean(actor);
  const showPrivate = canViewPrivate && sp.showPrivate === '1';
  
  const { posts, pagination } = await searchVisibleContentList(
    query, 
    showPrivate, 
    sort, 
    order, 
    page, 
    pageSize
  );

  const fallbackThumbnail = '/images/no-image.png';

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20 animate-in fade-in duration-700">
      <Suspense fallback={null}>
        <DeleteNotification />
      </Suspense>

      {/* 1. ヒーローセクション: 検索とタイトルの統合 */}
      <div className="relative bg-[#0c0c0c] text-white pt-24 pb-48 border-b border-white/5 z-20">
        {/* 装飾用背景要素（ここでは overflow-hidden を適用） */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          {/* 管理用ツールボックス（右上） */}
          {canViewPrivate && (
            <div className="absolute top-0 right-6 z-30 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
              <PrivacyToggle initialShowPrivate={showPrivate} />
            </div>
          )}

          <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <Library size={20} className="text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Wiki Article</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-700 delay-100">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                記事一覧
              </h1>
              <p className="text-stone-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                知見を体系化し、次世代へ繋ぐ。投稿されたすべてのナレッジをここで検索、管理することができます。
              </p>
            </div>

            <div className="w-full lg:flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <PostSearchControl 
                initialQuery={query}
                initialSort={sort}
                initialOrder={order}
                session={session}
                showPrivate={showPrivate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. メインコンテンツエリア */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        
        {/* フィルタリング・ステータスバー */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-white/80 backdrop-blur-md border border-stone-200 p-4 rounded-[1.5rem] shadow-xl">
          <div className="flex items-center gap-4 text-sm font-bold text-stone-500 px-2">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span>表示中:</span>
            </div>
            <span className="text-stone-900 bg-stone-100 px-3 py-1 rounded-full text-xs">
              {query ? `「${query}」の検索結果` : 'すべての記事'}
            </span>
            <span className="text-stone-400">|</span>
            <span className="text-stone-600 italic">全 {pagination.totalCount} 件</span>
          </div>
        </div>

        {pagination.totalCount === 0 ? (
          <div className="text-center py-32 bg-white border border-stone-200 rounded-[3rem] shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
              <AlertCircle className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-2xl font-black text-stone-800 mb-3 tracking-tighter">記事が見つかりません</h3>
            <p className="text-stone-500 font-medium max-w-md mx-auto leading-relaxed">
              {query ? `「${query}」に一致する記事はありませんでした。キーワードを変えてお試しください。` : '現在、表示できる記事がありません。'}
            </p>
            {query && (
              <Link href="/posts" className="mt-8 inline-flex items-center gap-2 text-amber-600 font-black hover:gap-3 transition-all">
                検索をリセット <ArrowRight size={18} />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-10">
              <PostPagination 
                totalPages={pagination.totalPages} 
                currentPage={pagination.currentPage} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => {
              const thumbnailUrl = getPublicThumbnailUrl(post.thumbnail);
              const formattedDate = post.updatedAt instanceof Date 
                ? post.updatedAt.toLocaleDateString('ja-JP').replace(/\//g, '-') 
                : '不明';

              return (
                <Link
                  href={`${`/posts/${post.slug}`}${
                    (() => {
                      const params = new URLSearchParams();
                      if (session) params.set('session', session);
                      if (sort !== 'updatedAt') params.set('sort', sort);
                      if (order !== 'desc') params.set('order', order);
                      if (showPrivate) params.set('showPrivate', '1');
                      const qs = params.toString();
                      return qs ? `?${qs}` : '';
                    })()
                  }`}
                  key={post.id} 
                  className="group bg-white border border-stone-200 hover:border-amber-400 rounded-[2.5rem] flex flex-col transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 block h-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* サムネイルエリア */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 border-b border-stone-100">
                    <img
                      src={thumbnailUrl || fallbackThumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                  
                  {/* コンテンツエリア */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 break-all line-clamp-1">
                        {post.slug}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-stone-900 mb-4 group-hover:text-amber-700 transition-colors leading-tight tracking-tighter line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <div className="mt-auto pt-6 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-0.5">Views</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                            <Eye className="w-3.5 h-3.5" />
                            {post.viewCount}
                          </div>
                        </div>
                        <div className="w-px h-6 bg-stone-100" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-0.5">Updated</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                          </div>
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-all group-hover:rotate-12">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
            <PostPagination 
              totalPages={pagination.totalPages} 
              currentPage={pagination.currentPage} 
            />
          </>
        )}
      </div>
    </div>
  );
}
