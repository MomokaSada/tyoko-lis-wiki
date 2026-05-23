import { getCurrentActor } from '@/server/lib/currentActor';
import { OrphanThumbnailCleanupForm } from '../orphan-thumbnail-cleanup-form';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';
import { ImageMinus, AlertTriangle } from 'lucide-react';

export default async function ThumbnailCleanupPage() {
  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';

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
          <>
            {/* 統計カード */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-stone-200 rounded-[1.75rem] p-6 shadow-sm text-center">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">検出された孤立サムネイル</p>
                <p className="text-4xl font-black text-stone-900">12</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-[1.75rem] p-6 shadow-sm text-center">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">ストレージ節約</p>
                <p className="text-4xl font-black text-stone-900">24.5 <span className="text-base font-bold text-stone-500">MB</span></p>
              </div>
              <div className="bg-white border border-stone-200 rounded-[1.75rem] p-6 shadow-sm text-center">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">最終スキャン日</p>
                <p className="text-2xl font-black text-stone-900">2025.07.15</p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                スキャンを実行
              </button>
              <button className="inline-flex items-center gap-2 text-sm font-bold text-red-600 px-5 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                すべて削除
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-[1.75rem] p-8 shadow-sm">
              <h2 className="text-lg font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">クリーンアップ実行</h2>
              <OrphanThumbnailCleanupForm />
            </div>
          </>
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
