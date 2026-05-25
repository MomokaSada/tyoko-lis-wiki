import { headers } from 'next/headers';
import { type Metadata } from 'next';
import Link from 'next/link';
import {
  Settings,
  Link as LinkIcon,
  FileText,
  Users,
  Clock,
  Eye,
  Shield,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { searchVisibleContentList, countVisibleContents, getTaxonomyOptions } from '@/server/services/contentService';
import { findEditSessions } from '@/server/repositories/editLinkRepository';
import { findAccountCreateSessions } from '@/server/repositories/accountCreateLinkRepository';
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

  // 編集リンクとアカウント作成リンクの取得
  const editSessions = await findEditSessions();
  const accountCreateSessions = await findAccountCreateSessions();

  // カテゴリと編集リンク詳細の取得
  const taxonomy = await getTaxonomyOptions();
  const actor = await getCurrentActor();
  const editLinksResult = actor ? await getEditLinks(actor) : { items: [], totalCount: 0 };

  // アクティブなリンク数
  const activeEditLinks = editSessions.items.filter(session => session.isActive).length;
  const activeAccountLinks = accountCreateSessions.filter(session => session.isActive).length;

  const editSessionsCount = editSessions.totalCount;
  const accountCreateSessionsCount = accountCreateSessions.length;

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

              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  href="/posts/create"
                  className="btn-primary inline-flex items-center gap-2 bg-amber-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/25"
                >
                  <Plus className="w-4 h-4" />
                  新規作成
                </Link>
                <button className="inline-flex items-center gap-2 bg-white text-stone-700 font-bold text-sm px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all">
                  <RefreshCw className="w-4 h-4" />
                  更新
                </button>
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
            miniChart
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
            icon={<Users className="w-6 h-6" />}
            label="アクティブ招待リンク"
            value={activeAccountLinks}
            subtext={`合計 ${accountCreateSessions.length} 件中`}
            theme="purple"
            progress={accountCreateSessions.length > 0 ? Math.round((activeAccountLinks / accountCreateSessions.length) * 100) : 0}
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="総閲覧数"
            value={publishedPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0).toLocaleString()}
            subtext="公開項目のみ"
            theme="orange"
            trend={{ value: '+12.4%', positive: true }}
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
