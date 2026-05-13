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
  Plus
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

  // ステータスバッジ関数
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
  const editLinks = actor ? await getEditLinks(actor) : [];

  // アクティブなリンク数
  const activeEditLinks = editSessions.filter(session => session.isActive).length;
  const activeAccountLinks = accountCreateSessions.filter(session => session.isActive).length;

  // 本日の日付
  const today = new Date().toLocaleDateString('ja-JP');

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 relative overflow-hidden">
          {/* Peeking Icon */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-stone-100/30 rounded-full flex items-center justify-center border-8 border-white/50 shadow-sm transition-transform duration-500 hover:scale-105 hover:translate-x-2 hover:translate-y-2 group z-0">
            <Settings className="w-20 h-20 text-stone-300 opacity-20 ml-12 mt-12 transition-transform duration-500 group-hover:rotate-45" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-4xl font-black text-stone-800 tracking-tighter mb-2 pl-4">Admin Dashboard</h2>
              <p className="text-stone-600 mb-4 pl-4">Wikiの管理タスクとシステム統計の概要</p>
              <div className="flex gap-3 pl-4">
                <span className="bg-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Clock size={12} /> {today}
                </span>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Shield size={12} /> {userRole || 'Admin'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-stone-100 rounded-full opacity-50"></div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="全記事数"
            value={totalPosts}
            subtext={`公開: ${publishedCount} | 下書き: ${totalPosts - publishedCount}`}
            theme="blue"
          />
          <StatCard
            icon={<LinkIcon className="w-6 h-6" />}
            label="アクティブ編集リンク"
            value={activeEditLinks}
            subtext={`合計 ${editSessions.length} 件中`}
            theme="emerald"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="アクティブ招待リンク"
            value={activeAccountLinks}
            subtext={`合計 ${accountCreateSessions.length} 件中`}
            theme="purple"
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="総閲覧数"
            value={publishedPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0).toLocaleString()}
            subtext="公開記事のみ"
            theme="orange"
          />
        </div>

        <AdminFormsClient
          editLinks={editLinks}
          taxonomy={taxonomy}
        />

        {/* 新規記事作成 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-black text-xl px-2">
            <FileText size={24} className="text-purple-500" /> 記事作成
          </div>
          <Link href="/posts/create" className="bg-stone-900 text-white rounded-2xl p-5 hover:bg-stone-800 transition-all group flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">新規記事作成</h3>
              <p className="text-sm opacity-80">新しい記事を追加する</p>
            </div>
            <div className="opacity-60 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </Link>
        </div>
      </div>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
