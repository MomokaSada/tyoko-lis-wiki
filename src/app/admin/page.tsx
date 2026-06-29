import { headers } from 'next/headers';
import { type Metadata } from 'next';
import Link from 'next/link';
import {
  Plus,
} from 'lucide-react';
import { searchVisibleContentList, countVisibleContents } from '@/server/services/contentService';
import { getEditLinks } from '@/server/services/editLinkService';
import { getAdminDashboardStats, getPublishedPostsViewCount } from '@/server/services/statisticsService';
import { getTaxonomyOptions } from '@/server/services/taxonomyService';

import { getCurrentActor } from '@/server/lib/currentActor';
import { getCurrentEditor } from '@/server/lib/currentEditor';

import { AdminFormsClient } from './admin-forms-client';
import { MobileActions } from '@/components/layout/MobileActions';

import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { AdminHeroSection } from './_sections/AdminHeroSection';
import { AdminStatsSection } from './_sections/AdminStatsSection';

export const metadata: Metadata = {
  robots: { index: false },
};

export default async function AdminPage() {
  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  // 統計データ取得（重複排除版）
  // - totalPosts は searchVisibleContentList の pagination から取得（countVisibleContents の呼び出しを削減）
  // - publishedPosts の個別取得は廃止し、statisticsService でビュー数合計を直接取得
  const [{ posts: recentPosts, pagination: recentPagination }] = await Promise.all([
    searchVisibleContentList('', true, 'updatedAt', 'desc', 1, 5),
  ]);

  const totalPosts = recentPagination.totalCount;
  const publishedCount = await countVisibleContents('', false);
  const publishedViewCount = await getPublishedPostsViewCount();

  // カテゴリと編集リンク詳細の取得
  const taxonomy = await getTaxonomyOptions();
  const actor = await getCurrentActor();
  const editLinksResult = actor ? await getEditLinks(actor) : { items: [], totalCount: 0 };

  // アクティブなリンク数
  const activeEditLinks = editLinksResult.items.filter(link => link.isActive).length;
  const editSessionsCount = editLinksResult.totalCount;

  // 統計情報（月間投稿数・ビュー統計）
  const stats = await getAdminDashboardStats();

  // 本日の日付
  const today = new Date().toLocaleDateString('ja-JP');

  return (
    <>
      {/* ═══ Admin Hero ═══ */}
      <AdminHeroSection userRole={userRole} today={today} />

      {/* ═══ 統計カード 4点グリッド ═══ */}
      <AdminStatsSection
        totalPosts={totalPosts}
        publishedCount={publishedCount}
        activeEditLinks={activeEditLinks}
        editSessionsCount={editSessionsCount}
        thisMonthCount={stats.thisMonthPosts}
        lastMonthCount={stats.lastMonthPosts}
        publishedPostsViewCount={publishedViewCount.toLocaleString()}
        viewTrend={stats.viewTrend}
        last7Chart={stats.last7Chart}
      />

      {/* ═══ Admin メイン グリッドカード ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <AdminFormsClient
            editLinks={editLinksResult.items}
            taxonomy={taxonomy}
          />

          {/* 新規項目作成 (CTA) - amber gradient */}
          <Link
            href="/posts/create"
            className="card-base group relative bg-gradient-to-br from-amber-500 via-amber-400 to-amber-500 border border-amber-400/30 rounded-2xl sm:rounded-[1.75rem] p-5 sm:p-6 overflow-hidden md:col-span-2 xl:col-span-1 shadow-lg shadow-amber-500/20"
          >
            <div className="absolute -top-10 sm:-top-12 -right-10 sm:-right-12 w-32 sm:w-40 h-32 sm:h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-600/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-auto">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-white shrink-0">
                  <Plus className="w-6 sm:w-7 h-6 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">新規項目作成</h3>
                  <p className="text-amber-100 text-xs sm:text-sm font-medium">新しい項目を追加する</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 bg-white text-amber-600 font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 group-hover:bg-amber-50 transition-colors shadow-md">
                項目を書く
                <svg className="w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
      />
    </>
  );
}
