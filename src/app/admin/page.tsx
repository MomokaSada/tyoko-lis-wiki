import { headers } from 'next/headers';
import Link from 'next/link';
import { Settings, Link as LinkIcon, FolderTree, AlertCircle } from 'lucide-react';

export default async function AdminPage() {
  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-stone-800 tracking-tighter mb-2">Admin Dashboard</h2>
          <p className="text-stone-500 font-medium">Wikiの管理タスクとアクセス権の制御を行います。</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-amber-800 font-bold">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        このページは role: admin 以上のユーザーのみアクセス可能です。(あなたのロール: {userRole || 'なし'})
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Create Post Link */}
        <Link href="/admin/edit-links" className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition-all group flex flex-col relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
            <LinkIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">記事編集リンク管理</h3>
          <p className="text-sm text-stone-500 font-medium mb-8 flex-1">
            一時的な記事編集セッションリンクを発行・管理します。有効期限や回数制限の状況を確認できます。
          </p>
          <div className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors">
            管理画面を開く
          </div>
          <LinkIcon className="absolute -bottom-8 -right-8 w-32 h-32 text-stone-50 opacity-50 -rotate-12" />
        </Link>

        {/* Categories Link */}
        <Link href="/admin/categories" className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-lg transition-all group flex flex-col relative overflow-hidden">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">カテゴリ管理</h3>
          <p className="text-sm text-stone-500 font-medium mb-8 flex-1">
            記事のカテゴリ階層構造の追加と親子関係の整理を行います。
          </p>
          <div className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors">
            管理画面を開く
          </div>
          <FolderTree className="absolute -bottom-8 -right-8 w-32 h-32 text-stone-50 opacity-50 -rotate-12" />
        </Link>
      </div>

    </div>
  );
}
