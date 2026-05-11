import { getCurrentActor } from '@/server/lib/currentActor';
import { OrphanThumbnailCleanupForm } from '../orphan-thumbnail-cleanup-form';
import Link from 'next/link';
import { ImageMinus, AlertTriangle } from 'lucide-react';

export default async function ThumbnailCleanupPage() {
  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-stone-900">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-2xl flex items-center justify-center shrink-0">
          <ImageMinus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tighter mb-1">サムネイルクリーンアップ</h1>
          <p className="text-stone-500 font-medium text-sm">参照されていない（記事に関連付けられていない）サムネイル画像を削除し、ストレージを整理します。</p>
        </div>
      </div>

      {!isOwner ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          この機能は owner のみ利用できます。
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">クリーンアップ実行</h2>
          <OrphanThumbnailCleanupForm />
        </div>
      )}

      <div className="pt-8">
        <Link href="/owner" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
          ← オーナー画面に戻る
        </Link>
      </div>
    </div>
  );
}
