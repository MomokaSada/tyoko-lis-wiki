'use client';

import { useActionState } from 'react';
import {
  cleanupOrphanThumbnailsAction,
  type ThumbnailCleanupActionState,
} from '@/server/actions/thumbnailActions';

const initialState: ThumbnailCleanupActionState = {
  error: null,
  deletedCount: 0,
  scannedCount: 0,
  referencedCount: 0,
  minAgeHours: 24,
};

export function OrphanThumbnailCleanupForm() {
  const [state, formAction, isPending] = useActionState(
    cleanupOrphanThumbnailsAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-amber-600 rounded-sm"></div>
          </div>
          <h3 className="font-bold text-amber-900">未使用サムネイルクリーンアップ</h3>
        </div>
        
        <p className="text-sm text-amber-800">
          参照されていないサムネイル画像のうち、{state.minAgeHours}時間以上前にアップロードされたものだけ削除します。
        </p>

        <form action={formAction}>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-amber-600/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isPending ? 'クリーンアップ中...' : '未使用サムネイルをクリーンアップする'}
          </button>
        </form>
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {state.error}
        </div>
      )}

      {state.scannedCount > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <h3 className="font-bold text-green-800">クリーンアップ結果</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-100 text-center">
              <div className="text-2xl font-black text-green-700">{state.scannedCount}</div>
              <div className="text-xs text-stone-600 font-medium mt-1">走査済み</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100 text-center">
              <div className="text-2xl font-black text-blue-700">{state.referencedCount}</div>
              <div className="text-xs text-stone-600 font-medium mt-1">参照中</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100 text-center">
              <div className="text-2xl font-black text-red-700">{state.deletedCount}</div>
              <div className="text-xs text-stone-600 font-medium mt-1">削除済み</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
