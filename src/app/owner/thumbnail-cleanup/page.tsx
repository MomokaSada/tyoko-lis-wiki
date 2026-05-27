import { getCurrentActor } from '@/server/lib/currentActor';
import { getOrphanThumbnailStats } from '@/server/services/thumbnailService';
import { OrphanThumbnailCleanupForm } from '../orphan-thumbnail-cleanup-form';
import { ThumbnailStatsCard } from './thumbnail-stats-card';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';
import { ImageMinus, AlertTriangle } from 'lucide-react';
import type { ThumbnailScanResult } from '@/server/actions/thumbnailActions';

export default async function ThumbnailCleanupPage() {
  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';

  let initialStats: ThumbnailScanResult = {
    scannedCount: 0,
    referencedCount: 0,
    orphanCount: 0,
    orphanSize: 0,
    scannedAt: new Date().toISOString(),
  };

  if (isOwner && actor) {
    const stats = await getOrphanThumbnailStats(actor);
    if (stats.scannedAt) {
      initialStats = {
        scannedCount: stats.scannedCount,
        referencedCount: stats.referencedCount,
        orphanCount: stats.orphanCount,
        orphanSize: stats.orphanSize,
        scannedAt: stats.scannedAt.toISOString(),
      };
    }
  }

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-stone-900">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-stone-100 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <ImageMinus className="w-16 h-16 text-stone-400/30 ml-6 mt-6" />
            </div>
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-7 bg-stone-400 rounded-full" />
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">サムネイルクリーンアップ</h1>
              </div>
              <p className="text-stone-500 text-sm pl-4">参照されていない（項目に関連付けられていない）サムネイル画像を削除し、ストレージを整理します。</p>
            </div>
          </div>
        </div>

        {!isOwner ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            この機能は owner のみ利用できます。
          </div>
        ) : (
          <div className="space-y-6">
            <ThumbnailStatsCard initialStats={initialStats} />

            <div className="bg-white border border-stone-200 rounded-[1.75rem] p-8 shadow-sm">
              <h2 className="text-lg font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">クリーンアップ実行</h2>
              <OrphanThumbnailCleanupForm />
            </div>
          </div>
        )}

        <div className="pt-8">
          <Link href="/owner" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
            ← オーナー画面に戻る
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
