import React from 'react';
import {
    getHomePageData,
} from '@/server/services/contentService';
import { PopularRankingBoard } from '@/components/features/home/PopularRankingBoard';
import { MobileActions } from '@/components/layout/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { WelcomeBannerSection } from './_sections/WelcomeBannerSection';
import { RecentPostsSection } from './_sections/RecentPostsSection';
import { FeaturedPostSection } from './_sections/FeaturedPostSection';
import { PendingPasskeyRegistration } from '@/components/features/home/PendingPasskeyRegistration';

// トップページは 60 秒ごとに ISR で再生成する。
// force-dynamic から移行することで、同一訪問者への連続リクエストで
// キャッシュヒットし、データベース負荷を軽減する。
// 投稿作成・編集後は on-demand revalidation で即時反映される。
export const revalidate = 60;

export default async function HomePage() {
  const { recentPosts, featuredPost, allTimePosts, weeklyPosts, totalPosts } = await getHomePageData();

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8 animate-in fade-in duration-500">
        {/* ウェルカムバナー */}
        <WelcomeBannerSection totalPosts={totalPosts} />

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

      {/* 登録後のパスキー登録試行（sessionStorage フラグがあれば1回だけ実行） */}
      <PendingPasskeyRegistration />
    </>
  );
}
