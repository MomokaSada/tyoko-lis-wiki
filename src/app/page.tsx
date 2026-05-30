import React from 'react';
import { searchVisibleContentList, getWeeklyPopularContentList } from '@/server/services/contentService';
import { PopularRankingBoard } from '@/components/features/home/PopularRankingBoard';
import { MobileActions } from '@/components/layout/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { WelcomeBannerSection } from './_sections/WelcomeBannerSection';
import { RecentPostsSection } from './_sections/RecentPostsSection';
import { FeaturedPostSection } from './_sections/FeaturedPostSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 本番データ取得 (最新3件を急上昇項目代わりに表示)
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
        <WelcomeBannerSection totalPosts={posts.length} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* 最新項目リスト */}
          <RecentPostsSection posts={recentPosts} />

          {/* 注目の項目 */}
          <FeaturedPostSection post={featuredPost} />
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
      />
    </>
  );
}
