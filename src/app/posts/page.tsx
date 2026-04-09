import { getCurrentActor } from '@/server/lib/currentActor';
import { searchVisibleContentList } from '@/server/services/contentService';
import Link from 'next/link';
import { Search, Hash, Clock, Eye, AlertCircle, Edit3 } from 'lucide-react';
import { DeleteNotification } from '@/components/features/posts/DeleteNotification';
import { Suspense } from 'react';

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const query = typeof sp.q === 'string' ? sp.q : '';
  const session = typeof sp.session === 'string' ? sp.session : '';
  const actor = await getCurrentActor();
  const canViewPrivate = Boolean(actor);
  const showPrivate = canViewPrivate && sp.showPrivate === '1';
  const posts = await searchVisibleContentList(query, showPrivate);

  const buildPostsUrl = (nextShowPrivate: boolean) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (session) params.set('session', session);
    if (nextShowPrivate) params.set('showPrivate', '1');
    const qs = params.toString();
    return qs ? `/posts?${qs}` : '/posts';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500 min-h-screen">
      <Suspense fallback={null}>
        <DeleteNotification />
      </Suspense>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter mb-2">Wiki Articles</h1>
          <p className="text-stone-500 font-medium">投稿されたすべての記事一覧です。検索や絞り込みが可能です。</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <form method="get" className="flex-1 flex gap-2">
          {session && <input type="hidden" name="session" value={session} />}
          {showPrivate && <input type="hidden" name="showPrivate" value="1" />}
          
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="記事タイトル・本文・スラッグで検索..."
              className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-stone-800 transition-all shadow-sm"
            />
          </div>
          <button type="submit" className="bg-stone-900 text-white font-bold px-8 py-3 rounded-2xl hover:bg-stone-800 transition-colors shadow-sm">
            検索
          </button>
        </form>

        {canViewPrivate && (
          <div className="flex items-center shrink-0">
            <Link
              href={buildPostsUrl(!showPrivate)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${
                showPrivate 
                  ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' 
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {showPrivate ? '公開中の記事だけを見る' : '非公開記事も表示する'}
            </Link>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 border border-stone-200 rounded-3xl">
          <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-700 mb-2">記事が見つかりません</h3>
          <p className="text-stone-500">{query ? '検索条件に一致する記事はありませんでした。' : '公開中の記事はまだありません。'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              href={`${`/posts/${post.slug}`}${
                (() => {
                  const params = new URLSearchParams();
                  if (session) params.set('session', session);
                  if (showPrivate) params.set('showPrivate', '1');
                  const qs = params.toString();
                  return qs ? `?${qs}` : '';
                })()
              }`}
              key={post.id} 
              className="group bg-white border border-stone-200 hover:border-amber-400 rounded-3xl p-6 flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 block h-full relative"
            >
              {canViewPrivate && !post.isPublished && (
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                  Private
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-stone-300" />
                  <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                    {post.slug}
                  </span>
                </div>
                <h3 className="text-xl font-black text-stone-800 mb-3 group-hover:text-amber-700 transition-colors leading-tight line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
                <div className="flex items-center gap-4 text-xs font-bold text-stone-400">
                  <div className="flex items-center gap-1.5" title="閲覧数">
                    <Eye className="w-4 h-4" /> {post.viewCount}
                  </div>
                  <div className="flex items-center gap-1.5" title="最終更新">
                    <Clock className="w-4 h-4" /> {post.updatedAt.toISOString().split('T')[0]}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
