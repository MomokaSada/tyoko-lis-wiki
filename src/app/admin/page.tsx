import { headers } from 'next/headers';
import Link from 'next/link';
import { 
  Settings, 
  Link as LinkIcon, 
  FolderTree, 
  AlertCircle,
  FileText,
  Users,
  TrendingUp,
  Clock,
  Activity,
  Eye,
  Edit3,
  BarChart3,
  Shield,
  Database,
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { searchVisibleContentList, countVisibleContents, getTaxonomyOptions } from '@/server/services/contentService';
import { findEditSessions } from '@/server/repositories/editLinkRepository';
import { findAccountCreateSessions } from '@/server/repositories/accountCreateLinkRepository';
import { getEditLinks } from '@/server/services/editLinkService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import { CategoryCreateForm } from './categories/category-create-form';
import { CategoryUpdateForm } from './categories/category-update-form';
import { EditLinkForm } from './edit-links/edit-link-form';
import { AdminFormsClient } from './admin-forms-client';

export default async function AdminPage() {
  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  // ステータスバッジ関数
  function getStatusBadge(status: 'active' | 'expired' | 'inactive' | 'limit-reached') {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 有効</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 期限切れ</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> 無効化済み</span>;
      case 'limit-reached':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> 上限到達</span>;
    }
  }

  // 統計データ取得
  const { posts: allPosts } = await searchVisibleContentList('', true, 'updatedAt', 'desc', 1, 100);
  const { posts: publishedPosts } = await searchVisibleContentList('', false, 'updatedAt', 'desc', 1, 100);
  const totalPosts = await countVisibleContents('', true);
  const publishedCount = await countVisibleContents('', false);
  
  // 編集リンクとアカウント作成リンクの取得
  const editSessions = await findEditSessions();
  const accountCreateSessions = await findAccountCreateSessions();
  
  // カテゴリと編集リンク詳細の取得
  const taxonomy = await getTaxonomyOptions();
  const actor = await getCurrentActor();
  const editLinks = actor ? await getEditLinks(actor) : [];
  
  // 最新の記事（公開・非公開両方）
  const recentPosts = allPosts.slice(0, 5);
  
  // アクティブなリンク数
  const activeEditLinks = editSessions.filter(session => session.isActive).length;
  const activeAccountLinks = accountCreateSessions.filter(session => session.isActive).length;

  // 本日の日付
  const today = new Date().toLocaleDateString('ja-JP');

  // ステータスバッジ関数
  function getStatusBadge(status: 'active' | 'expired' | 'inactive' | 'limit-reached') {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 有効</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 期限切れ</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> 無効化済み</span>;
      case 'limit-reached':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> 上限到達</span>;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
      {/* ヘッダーセクション */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-4xl font-black text-stone-800 tracking-tighter mb-2">Admin Dashboard</h2>
            <p className="text-stone-600 mb-4">Wikiの管理タスクとシステム統計の概要</p>
            <div className="flex gap-3">
              <span className="bg-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Clock size={12} /> {today}
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Shield size={12} /> {userRole || 'Admin'}
              </span>
            </div>
          </div>
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <Settings className="w-12 h-12 text-stone-600" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-stone-100 rounded-full opacity-50"></div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-stone-800">{totalPosts}</span>
          </div>
          <h3 className="font-bold text-stone-800 mb-1">全記事数</h3>
          <p className="text-sm text-stone-500">公開: {publishedCount} | 下書き: {totalPosts - publishedCount}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-stone-800">{activeEditLinks}</span>
          </div>
          <h3 className="font-bold text-stone-800 mb-1">アクティブ編集リンク</h3>
          <p className="text-sm text-stone-500">合計 {editSessions.length} 件中</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-stone-800">{activeAccountLinks}</span>
          </div>
          <h3 className="font-bold text-stone-800 mb-1">アクティブ招待リンク</h3>
          <p className="text-sm text-stone-500">合計 {accountCreateSessions.length} 件中</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-stone-800">
              {publishedPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0).toLocaleString()}
            </span>
          </div>
          <h3 className="font-bold text-stone-800 mb-1">総閲覧数</h3>
          <p className="text-sm text-stone-500">公開記事のみ</p>
        </div>
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

      {/* システムステータス */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8">
        <div className="flex items-center gap-2 text-stone-800 font-black text-xl mb-6">
          <Database size={24} className="text-stone-600" /> システムステータス
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-bold text-stone-800">データベース</p>
              <p className="text-sm text-stone-500">正常に稼働中</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-bold text-stone-800">認証システム</p>
              <p className="text-sm text-stone-500">正常に稼働中</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-bold text-stone-800">コンテンツ管理</p>
              <p className="text-sm text-stone-500">正常に稼働中</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
