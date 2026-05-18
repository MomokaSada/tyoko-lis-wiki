import { getCurrentActor } from '@/server/lib/currentActor';
import { OrphanThumbnailCleanupForm } from '../orphan-thumbnail-cleanup-form';
import { ImageMinus, ShieldAlert } from 'lucide-react';
import { OwnerLayout } from '@/components/layout/admin/OwnerLayout';

export default async function ThumbnailCleanupPage() {
  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';

  if (!isOwner) {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            この機能は owner のみ利用できます。
          </div>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-stone-500 font-bold text-xs uppercase tracking-widest">
              <ImageMinus size={14} />
              <span>System Maintenance</span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">サムネイルクリーンアップ</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mb-4">
                <ImageMinus size={24} />
              </div>
              <h2 className="text-lg font-black text-stone-800">ストレージの最適化</h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                どの記事からもリンクされていない孤立したサムネイルファイルを検出し、一括削除することでストレージを最適化します。
              </p>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 font-medium">
                ⚠️ この操作は取り消すことができません。慎重に実行してください。
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-stone-400 rounded-full" />
                <h2 className="text-lg font-black text-stone-800">クリーンアップ実行</h2>
              </div>
              <OrphanThumbnailCleanupForm />
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
