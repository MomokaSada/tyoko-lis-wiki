import { headers } from 'next/headers';
import { type Metadata } from 'next';
import Link from 'next/link';
import { and, sql, gte, lt } from 'drizzle-orm';
import {
  Settings,
  Link as LinkIcon,
  FileText,
  Calendar,
  Clock,
  Eye,
  Shield,
  Plus,
} from 'lucide-react';
import { db } from '@/db';
import { contents, contentViewStats } from '@/db/schema';
import { searchVisibleContentList, countVisibleContents, getTaxonomyOptions } from '@/server/services/contentService';
import { findEditSessions } from '@/server/repositories/editLinkRepository';
import { getEditLinks } from '@/server/services/editLinkService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { AdminFormsClient } from './admin-forms-client';
import { StatCard } from '@/components/ui/StatCard';
import { MobileActions } from '@/components/posts/MobileActions';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';

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
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);

  const [last30Rows, prev30Rows, last7Rows] = await Promise.all([
    // 直近30日
    db
      .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(gte(contentViewStats.date, thirtyDaysAgo)),
    // 30〜60日前
    db
      .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(and(gte(contentViewStats.date, sixtyDaysAgo), lt(contentViewStats.date, thirtyDaysAgo))),
    // 直近7日（日別）
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
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-10 overflow-hidden shadow-sm">
            {/* 左上のcircle + 設定アイコン */}
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-stone-100 rounded-full flex items-center justify-center border-[12px] border-white/60 shadow-inner pointer-events-none">
              <Settings className="w-24 h-24 text-stone-300/40 ml-8 mt-8" />
            </div>

            {/* 右下のオーブ */}
            <div className="absolute -right-16 -bottom-16 w-44 h-44 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="absolute top-8 right-32 w-3 h-3 bg-stone-400 rounded-full animate-pulse pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-3 pl-2">
                  <div className="w-1.5 h-8 bg-stone-400 rounded-full" />
                  <h1 className="text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-none">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-stone-500 text-base pl-4 max-w-lg leading-relaxed">
                  Wikiの管理タスクとシステム統計の概要
                </p>

                <div className="flex flex-wrap gap-2.5 mt-5 pl-4">
                  <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs font-bold px-3.5 py-1.5 rounded-full border border-stone-200">
                    <Clock className="w-3.5 h-3.5" />
                    {today}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-green-200">
                    <Shield className="w-3.5 h-3.5" />
                    {userRole || 'Admin'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══ 統計カード 4点グリッド ═══ */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="全項目数"
            value={totalPosts}
            subtext={`公開: ${publishedCount} | 下書き: ${totalPosts - publishedCount}`}
            theme="blue"
            miniChart={last7Chart}
          />
          <StatCard
            icon={<LinkIcon className="w-6 h-6" />}
            label="アクティブ編集リンク"
            value={activeEditLinks}
            subtext={`合計 ${editSessionsCount} 件中`}
            theme="emerald"
            progress={editSessionsCount > 0 ? Math.round((activeEditLinks / editSessionsCount) * 100) : 0}
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="今月の投稿"
            value={thisMonthCount}
            subtext={lastMonthCount > 0 ? `先月: ${lastMonthCount}件` : ''}
            theme="purple"
            progress={lastMonthCount > 0 ? Math.min(100, Math.round((thisMonthCount / lastMonthCount) * 100)) : 100}
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="総閲覧数"
            value={publishedPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0).toLocaleString()}
            subtext="公開項目のみ"
            theme="orange"
            trendValue={viewTrend}
          />
        </div>
      </section>

      {/* ═══ Admin メイン グリッドカード ═══ */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AdminFormsClient
            editLinks={editLinksResult.items}
            taxonomy={taxonomy}
          />

          {/* 新規項目作成 (CTA) - amber gradient */}
          <Link
            href="/posts/create"
            className="card-base group relative bg-gradient-to-br from-amber-500 via-amber-400 to-amber-500 border border-amber-400/30 rounded-[1.75rem] p-6 overflow-hidden md:col-span-2 xl:col-span-1 shadow-lg shadow-amber-500/20"
          >
            {/* 光彩 */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-600/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-auto">
                <div className="w-13 h-13 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-white">
                  <Plus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight">新規項目作成</h3>
                  <p className="text-amber-100 text-sm font-medium">新しい項目を追加する</p>
                </div>
              </div>

              <div className="mt-6 w-full py-3 bg-white text-amber-600 font-extrabold text-base rounded-xl flex items-center justify-center gap-2 group-hover:bg-amber-50 transition-colors shadow-md">
                項目を書く
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
