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
  LayoutDashboard
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

  const [{ posts: recentPosts }, { posts: publishedPosts }] = await Promise.all([
    searchVisibleContentList('', true, 'updatedAt', 'desc', 1, 5),
    searchVisibleContentList('', false, 'updatedAt', 'desc', 1, 100),
  ]);

  const totalPosts = await countVisibleContents('', true);
  const publishedCount = await countVisibleContents('', false);

  const editSessions = await findEditSessions();
  const accountCreateSessions = await findAccountCreateSessions();
  const taxonomy = await getTaxonomyOptions();
  const actor = await getCurrentActor();
  const editLinks = actor ? await getEditLinks(actor) : [];

  const activeEditLinks = editSessions.filter(session => session.isActive).length;
  const activeAccountLinks = accountCreateSessions.filter(session => session.isActive).length;
  const today = new Date().toLocaleDateString('ja-JP');

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight">System Administration</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">システム全体の管理ダッシュボード</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-stone-100 text-stone-600">
              <Clock className="w-3 h-3 mr-1.5" />
              {today}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Shield className="w-3 h-3 mr-1.5" />
              {userRole || 'Admin'}
            </span>
          </div>
        </div>

        {/* Stats Grid: Refined and Spaced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Management Sections: Split into logical groups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Primary Management Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-base px-2">
              <Settings className="w-4 h-4 text-amber-500" />
              管理メニュー
            </h3>
            <AdminFormsClient
              editLinks={editLinks}
              taxonomy={taxonomy}
            />
          </div>

          {/* Quick Actions / Secondary Content */}
          <div className="space-y-6">
            <div className="bg-stone-900 text-stone-50 p-5 rounded-2xl shadow-sm space-y-3.5">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Plus className="w-4 h-4 text-amber-400" />
                クイックアクション
              </h3>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                新しいコンテンツの追加をスピーディーに行えます。
              </p>
              <div className="pt-1">
                <Link 
                  href="/posts/create" 
                  className="flex flex-col items-center justify-center p-4 bg-stone-800 hover:bg-stone-700 active:bg-stone-950 rounded-xl text-sm font-bold gap-2 text-amber-400 border border-stone-700 transition-colors"
                >
                  <Plus className="w-6 h-6" />
                  新規記事作成
                </Link>
              </div>
            </div>
          </div>
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
