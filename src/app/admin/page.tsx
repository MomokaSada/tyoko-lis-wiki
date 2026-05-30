import { headers } from 'next/headers';
import { type Metadata } from 'next';
import Link from 'next/link';
import { and, sql, gte, lt } from 'drizzle-orm';
import {
  Plus,
} from 'lucide-react';
import { db } from '@/db';
import { contents, contentViewStats } from '@/db/schema';
import { searchVisibleContentList, countVisibleContents, getTaxonomyOptions } from '@/server/services/contentService';
import { findEditSessions } from '@/server/repositories/editLinkRepository';
import { getEditLinks } from '@/server/services/editLinkService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { AdminFormsClient } from './admin-forms-client';
import { MobileActions } from '@/components/layout/MobileActions';
import { getCurrentEditor } from '@/server/lib/currentEditor';
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

  // 統計データ取得
  const [{ posts: recentPosts }, { posts: publishedPosts }] = await Promise.all([
    searchVisibleContentList('', true, 'updatedAt', 'desc', 1, 5),
    searchVisibleContentList('', false, 'updatedAt', 'desc', 1, 100),
  ]);

  const totalPosts = await countVisibleContents('', true);
  const publishedCount = await countVisibleContents('', false);

  // 編集リンクの取得
  const editSessions = await findEditSessions();

  // カテゴリと編集リンク詳細の取得
  const taxonomy = await getTaxonomyOptions();
  const actor = await getCurrentActor();
  const editLinksResult = actor ? await getEditLinks(actor) : { items: [], totalCount: 0 };

  // アクティブなリンク数
  const activeEditLinks = editSessions.items.filter(session => session.isActive).length;
  const editSessionsCount = editSessions.totalCount;

  // ── 今月の投稿数 ──
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const [thisMonthPosts, lastMonthPosts] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(gte(contents.createdAt, monthStart)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(and(gte(contents.createdAt, lastMonthStart), lt(contents.createdAt, monthStart))),
  ]);

  const thisMonthCount = Number(thisMonthPosts[0]?.count ?? 0);
  const lastMonthCount = Number(lastMonthPosts[0]?.count ?? 0);

  // ── ビュー統計（実トレンド + 週間チャート） ──
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);

  const [last30Rows, prev30Rows, last7Rows] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(gte(contentViewStats.date, thirtyDaysAgo)),
    db
      .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(and(gte(contentViewStats.date, sixtyDaysAgo), lt(contentViewStats.date, thirtyDaysAgo))),
    db
      .select({ date: contentViewStats.date, total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(gte(contentViewStats.date, new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)))
      .groupBy(contentViewStats.date)
      .orderBy(contentViewStats.date),
  ]);

  const last30Total = last30Rows[0]?.total ?? 0;
  const prev30Total = prev30Rows[0]?.total ?? 0;
  const viewTrend = prev30Total > 0 ? ((last30Total - prev30Total) / prev30Total) * 100 : 0;

  // 7日間の日別ビューを配列に（データがない日は0）
  const last7Chart: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const row = last7Rows.find((r) => r.date === d);
    last7Chart.push(row?.total ?? 0);
  }

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
        thisMonthCount={thisMonthCount}
        lastMonthCount={lastMonthCount}
        publishedPostsViewCount={publishedPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0).toLocaleString()}
        viewTrend={viewTrend}
        last7Chart={last7Chart}
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
