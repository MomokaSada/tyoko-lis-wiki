'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  History,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { DiffModal } from '@/app/owner/edit-link-usage/detail/diff-modal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LogItem = {
  id: number;
  revisionNumber: number;
  type: 'snapshot' | 'diff';
  title: string | null;
  createdAt: string; // ISO string (serialized from server)
  /** 編集者の表示ラベル（owner 権限時のみ解決） */
  editorLabel?: string | null;
};

type FilterMode = 'snapshot' | 'all';
type SortOrder = 'asc' | 'desc';

type Props = {
  allLogs: LogItem[];
  snapshotLogs: LogItem[];
  contentId: number;
  /** リビジョン番号 → 編集者ラベル（owner 権限時のみ） */
  revisionLabels?: Record<number, string | null>;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HistoryTable({
  allLogs,
  snapshotLogs,
  contentId,
  revisionLabels,
}: Props) {
  const [filterMode, setFilterMode] = useState<FilterMode>('snapshot');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1); // ソート変更時に先頭ページへ
  }, []);

  // フィルター + ソート
  const sortedLogs = useMemo(() => {
    const base = filterMode === 'all' ? allLogs : snapshotLogs;
    return [...base].sort((a, b) =>
      sortOrder === 'asc'
        ? a.revisionNumber - b.revisionNumber
        : b.revisionNumber - a.revisionNumber,
    );
  }, [allLogs, snapshotLogs, filterMode, sortOrder]);

  // ページネーション
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageLogs = useMemo(
    () => sortedLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sortedLogs, safePage],
  );

  const goPrevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNextPage = useCallback(
    () => setPage((p) => Math.min(totalPages, p + 1)),
    [totalPages],
  );

  const selectFilter = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    setFilterOpen(false);
    setPage(1);
  }, []);

  // ドロップダウン外クリックで閉じる
  const filterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  // 総リビジョン数（DiffModal のナビゲーション用）
  const totalRevisionCount = useMemo(
    () => Math.max(...allLogs.map((l) => l.revisionNumber), 0),
    [allLogs],
  );

  return (
    <div className="space-y-6">
      {/* フィルターバー */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-all"
            >
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <span>{filterMode === 'snapshot' ? 'スナップショットのみ' : 'すべての履歴'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                  filterOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {filterOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-10 overflow-hidden animate-fade-in">
                <button
                  type="button"
                  onClick={() => selectFilter('snapshot')}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors ${
                    filterMode === 'snapshot'
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  スナップショットのみ
                </button>
                <button
                  type="button"
                  onClick={() => selectFilter('all')}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors ${
                    filterMode === 'all'
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  すべての履歴
                </button>
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-stone-400 tabular-nums">
          全 {allLogs.length} 件 / スナップショット {snapshotLogs.length} 件
        </span>
      </div>

      {/* テーブル */}
      {pageLogs.length === 0 ? (
        <div className="card">
          <div className="card-body py-16 text-center">
            <History className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-400">編集履歴はまだありません。</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body space-y-5">
            <div className="table-container table-card-mode">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }} data-label="リビジョン">
                      <button
                        type="button"
                        onClick={toggleSort}
                        className="inline-flex items-center gap-1.5 font-bold hover:text-stone-700 transition-colors"
                      >
                        <span>リビジョン</span>
                        {sortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </th>
                    <th style={{ textAlign: 'center' }} data-label="種別">種別</th>
                    <th style={{ textAlign: 'center' }} data-label="作成日時">作成日時</th>
                    <th style={{ textAlign: 'center' }} data-label="差分">差分</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLogs.map((log) => (
                    <tr key={log.id} id={`rev-${log.revisionNumber}`}>
                      {/* リビジョン番号 */}
                      <td
                        className="text-left text-sm text-stone-600 tabular-nums"
                        data-label="リビジョン"
                      >
                        v{log.revisionNumber}
                      </td>

                      {/* 種別 */}
                      <td className="text-center" data-label="種別">
                        <span
                          className={`badge ${
                            log.type === 'snapshot'
                              ? 'badge-emerald'
                              : 'badge-stone'
                          }`}
                        >
                          {log.type === 'snapshot' ? 'スナップショット' : '差分'}
                        </span>
                      </td>

                      {/* 作成日時 */}
                      <td
                        className="text-center whitespace-nowrap text-sm text-stone-500"
                        data-label="作成日時"
                      >
                        {formatDateTimeJst(new Date(log.createdAt))}
                      </td>

                      {/* 差分ボタン */}
                      <td className="text-center" data-card-action>
                        <DiffModal
                          contentId={contentId}
                          revisionNumber={log.revisionNumber}
                          revisionCount={totalRevisionCount}
                          editorLabel={log.editorLabel}
                          revisionLabels={revisionLabels}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={goPrevPage}
                  className="btn-ghost btn-sm disabled:text-stone-200 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers(safePage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-xs text-stone-300 px-1 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        p === safePage
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={goNextPage}
                  className="btn-ghost btn-sm disabled:text-stone-200 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 凡例 */}
      <div className="flex items-center gap-4 text-xs text-stone-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          スナップショット（全文保存）
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-300" />
          差分（前回からの変更のみ）
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page numbers utility（先頭・末尾は固定、中間は最大5個 + 省略記号）
// ---------------------------------------------------------------------------

function getPageNumbers(
  current: number,
  total: number,
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);

  return pages;
}
