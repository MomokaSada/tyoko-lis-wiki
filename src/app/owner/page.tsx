import { headers } from 'next/headers';
import Link from 'next/link';
import { Crown, AlertTriangle, UserX, ShieldBan, Link2, KeySquare, ImageMinus } from 'lucide-react';
import { OrphanThumbnailCleanupForm } from './orphan-thumbnail-cleanup-form';

export default async function OwnerPage() {
  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-stone-900">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="text-4xl font-black text-stone-800 tracking-tighter mb-2">Owner Dashboard</h2>
          <p className="text-stone-500 font-medium">最高の権限を持つ管理者画面。全システムの制御が可能です。</p>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm text-stone-300 font-bold">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-amber-500" />
          このページは role: owner のユーザーのみアクセス可能です。(あなたのロール: <span className="text-amber-500">{userRole || 'なし'}</span>)
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Actions */}
        <Link href="/owner/account-create-links" className="bg-white border border-stone-200 p-6 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group flex flex-col items-start gap-4 text-left relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors relative z-10">
            <KeySquare className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h4 className="font-bold text-stone-800 mb-1 text-lg">アカウント作成リンク管理</h4>
            <p className="text-xs text-stone-500 font-medium">新規登録用セッションの発行と管理</p>
          </div>
          <KeySquare className="absolute -bottom-4 -right-4 w-24 h-24 text-stone-50 opacity-50 group-hover:scale-110 transition-transform" />
        </Link>

        <Link href="/owner/account-bans" className="bg-white border border-stone-200 p-6 rounded-2xl hover:border-red-400 hover:shadow-md transition-all group flex flex-col items-start gap-4 text-left relative overflow-hidden">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors relative z-10">
            <UserX className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h4 className="font-bold text-stone-800 mb-1 text-lg">アカウントBAN管理</h4>
            <p className="text-xs text-stone-500 font-medium">アクセス拒否と強制ログアウト</p>
          </div>
          <UserX className="absolute -bottom-4 -right-4 w-24 h-24 text-stone-50 opacity-50 group-hover:scale-110 transition-transform" />
        </Link>

        <Link href="/owner/ip-bans" className="bg-white border border-stone-200 p-6 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all group flex flex-col items-start gap-4 text-left relative overflow-hidden">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors relative z-10">
            <ShieldBan className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h4 className="font-bold text-stone-800 mb-1 text-lg">IPアドレスBAN管理</h4>
            <p className="text-xs text-stone-500 font-medium">悪意あるアクセス元の特定と拒否</p>
          </div>
          <ShieldBan className="absolute -bottom-4 -right-4 w-24 h-24 text-stone-50 opacity-50 group-hover:scale-110 transition-transform" />
        </Link>

        <Link href="/owner/edit-link-usage" className="bg-white border border-stone-200 p-6 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col items-start gap-4 text-left relative overflow-hidden">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors relative z-10">
            <Link2 className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h4 className="font-bold text-stone-800 mb-1 text-lg">編集リンク使用状況</h4>
            <p className="text-xs text-stone-500 font-medium">発行済リンクの不正利用監査</p>
          </div>
          <Link2 className="absolute -bottom-4 -right-4 w-24 h-24 text-stone-50 opacity-50 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-black text-stone-800 mb-6 flex items-center gap-2">
            <ImageMinus className="w-5 h-5 text-stone-400" /> サムネイルクリーンアップ
        </h3>
        <OrphanThumbnailCleanupForm />
      </div>

    </div>
  );
}
