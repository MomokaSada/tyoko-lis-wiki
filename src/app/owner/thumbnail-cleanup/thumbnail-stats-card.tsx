'use client';

import { useState, useCallback } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { scanThumbnailsAction } from '@/server/actions/thumbnailActions';
import type { ThumbnailScanResult } from '@/server/actions/thumbnailActions';

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const v = bytes / Math.pow(1024, i);
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function ThumbnailStatsCard({
  initialStats,
}: {
  initialStats: ThumbnailScanResult;
}) {
  const [stats, setStats] = useState<ThumbnailScanResult>(initialStats);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const result = await scanThumbnailsAction();
      if ('error' in result) {
        setError(result.error);
      } else {
        setStats(result);
      }
    } catch {
      setError('スキャンに失敗しました。');
    } finally {
      setScanning(false);
    }
  }, []);

  return (
    <>
      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-[1.75rem] p-6 shadow-sm text-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">検出された孤立サムネイル</p>
          <p className="text-4xl font-black text-stone-900 tabular-nums">
            {stats.orphanCount}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-[1.75rem] p-6 shadow-sm text-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">ストレージ節約</p>
          <p className="text-4xl font-black text-stone-900 tabular-nums">
            {formatSize(stats.orphanSize)}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-[1.75rem] p-6 shadow-sm text-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">最終スキャン日</p>
          <p className="text-2xl font-black text-stone-900 tabular-nums">
            {formatDate(new Date(stats.scannedAt))}
          </p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'スキャン中...' : 'スキャンを実行'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-400 -mt-2">
        <div className="text-center">全 {stats.scannedCount} ファイル中</div>
        <div className="text-center">{stats.referencedCount} ファイル参照中</div>
        <div className="text-center" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
          {error}
        </div>
      )}
    </>
  );
}
