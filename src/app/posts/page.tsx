import { getCurrentActor } from '@/server/lib/currentActor';
import { searchVisibleContentList } from '@/server/services/contentService';
import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { MobileActions } from '@/components/layout/MobileActions';
import type { ContentSortKey, SortOrder } from '@/server/repositories/contentRepository';
import { PostsHeroSection } from './_sections/PostsHeroSection';
import { PostsStatusBar } from './_sections/PostsStatusBar';
import { PostsEmptyState } from './_sections/PostsEmptyState';
import { PostCardGrid } from './_sections/PostCardGrid';

export const metadata: Metadata = {
  title: '項目一覧 | Tyokore Wiki',
  description: 'Tyokore Wiki の項目一覧ページです。カテゴリやタグで検索・フィルタリングできます。',
};

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
  const categoryId = typeof sp.categoryId === 'string' ? parseInt(sp.categoryId) : undefined;

  const actor = await getCurrentActor();
  const canViewPrivate = Boolean(actor);
  const showPrivate = canViewPrivate && sp.showPrivate === '1';

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor(session);
  const hasEditSession = !!(editor && editor.type === 'session');

  const { posts, pagination } = await searchVisibleContentList(
    query,
    showPrivate,
    sort,
    order,
    page,
    pageSize,
    categoryId
  );

  return (
    <>
      <div className="min-h-screen bg-stone-50/50 pb-16 md:pb-20 animate-in fade-in duration-700">
        {/* 1. ヒーローセクション: 検索とタイトルの統合 */}
        <PostsHeroSection
          canViewPrivate={canViewPrivate}
          showPrivate={showPrivate}
          query={query}
          sort={sort}
          order={order}
          session={session}
        />

        {/* 2. メインコンテンツエリア */}
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 -mt-6 md:-mt-8 relative z-20">
          {/* フィルタリング・ステータスバー */}
          <PostsStatusBar
            query={query}
            categoryId={categoryId}
            totalCount={pagination.totalCount}
          />

          {pagination.totalCount === 0 ? (
            <PostsEmptyState query={query} categoryId={categoryId} />
          ) : (
            <PostCardGrid
              posts={posts}
              canViewPrivate={canViewPrivate}
              session={session}
              sort={sort}
              order={order}
              showPrivate={showPrivate}
              categoryId={categoryId}
              totalPages={pagination.totalPages}
              currentPage={pagination.currentPage}
            />
          )}
        </div>
      </div>

      {/* モバイル限定アクションボタン (FAB: ナビゲーション統合) */}
      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
      />
    </>
  );
}
