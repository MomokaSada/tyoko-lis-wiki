import Link from 'next/link';
import { DataTableSearch } from './DataTableSearch';
import { Pagination } from '@/components/ui/Pagination';
import type { ListQuery, SortOrder } from '@/types/listQuery';

export type Column<T> = {
  /** データのキー。sortable の場合 sort パラメータに使われる */
  key: string;
  /** ヘッダー表示ラベル */
  label: string;
  /** ソート可能にするか */
  sortable?: boolean;
  /** モバイルカード表示でアクション列として扱う（ラベル非表示、右寄せ、区切り線） */
  isAction?: boolean;
  /** セルの描画。省略時は row[key] を文字列表示 */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** ヘッダーセルに追加するクラス */
  headerClassName?: string;
  /** データセルに追加するクラス */
  cellClassName?: string;
  /** ヘッダーのテキスト揃え（指定しない場合は CSS の初期値に従う） */
  headerAlign?: 'left' | 'center' | 'right';
  /** セルのテキスト揃え（指定しない場合は CSS の初期値に従う） */
  cellAlign?: 'left' | 'center' | 'right';
};

type DataTableProps<T extends Record<string, unknown>> = {
  /** 一覧表示するデータ行 */
  items: T[];
  /** parseListQuery の戻り値 */
  query: ListQuery<string>;
  /** 総件数 */
  totalCount: number;
  /** カラム定義 */
  columns: Column<T>[];
  /** 検索・ソートのベースパス（例: "/admin/categories"） */
  basePath: string;
  /** デフォルトのソートキー（現在のソートと異なる場合のみ URL に付与） */
  defaultSortBy: string;
  /** デフォルトのソート順 */
  defaultSortOrder?: SortOrder;
  /** データが 0 件のときのメッセージ */
  emptyMessage?: string;
  /** 検索ボックスのプレースホルダー */
  searchPlaceholder?: string;
  /** ツールバー左側に追加する要素（検索ボックスの前に挿入) */
  toolbar?: React.ReactNode;
  /** デフォルトの検索ボックスを非表示にする（toolbar で独自の検索フォームを配置する場合） */
  hideSearch?: boolean;
  /**
   * 同一ページに複数の DataTable を置く場合のクエリパラメータ prefix。
   * 例: "b" → sort→bsort, page→bpage, q→bq, order→border
   */
  paramPrefix?: string;
};

/**
 * 一覧画面用の DataTable コンポーネント。
 * Server Component として動作する。
 * 検索部分のみ DataTableSearch (Client Component) に委譲。
 * ソート・ページネーションは <Link scroll={false}> でスクロール位置を維持。
 */
export async function DataTable<T extends Record<string, unknown>>({
  items,
  query,
  totalCount,
  columns,
  basePath,
  defaultSortBy,
  defaultSortOrder = 'desc',
  emptyMessage = 'データがありません',
  searchPlaceholder = '検索...',
  toolbar,
  hideSearch = false,
  paramPrefix = '',
}: DataTableProps<T>) {
  const p = (name: string) => `${paramPrefix}${name}`;

  const currentSort = query.sortBy ?? defaultSortBy;
  const currentOrder = query.sortOrder ?? defaultSortOrder;
  const currentQ = query.searchQuery ?? '';
  const currentPage = query.page;
  const totalPages = Math.max(1, Math.ceil(totalCount / query.limit));

  function sortUrl(key: string): string {
    const order = currentSort === key && currentOrder === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    if (currentQ) params.set(p('q'), currentQ);
    if (key !== defaultSortBy) params.set(p('sort'), key);
    if (order !== defaultSortOrder) params.set(p('order'), order);
    params.set(p('page'), '1');
    return `${basePath}?${params.toString()}`;
  }

  function pageUrl(page: number): string {
    const params = new URLSearchParams();
    if (currentQ) params.set(p('q'), currentQ);
    if (currentSort !== defaultSortBy) params.set(p('sort'), currentSort);
    if (currentOrder !== defaultSortOrder) params.set(p('order'), currentOrder);
    params.set(p('page'), String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="card">
      {/* ── ツールバー: 検索 ── */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {toolbar}
          {!hideSearch && (
            <DataTableSearch
              defaultValue={currentQ}
              placeholder={searchPlaceholder}
              paramPrefix={paramPrefix}
              sort={currentSort}
              order={currentOrder}
              basePath={basePath}
            />
          )}
        </div>
      </div>

      {/* ── テーブル ── */}
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
          </div>
          <p className="text-stone-500 text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="table-container table-card-mode">
          <table className="table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={col.headerClassName ?? ''} style={col.headerAlign ? { textAlign: col.headerAlign } : undefined}>
                    {col.sortable ? (
                      <Link
                        href={sortUrl(col.key)}
                        scroll={false}
                        className="inline-flex items-center gap-1 hover:text-stone-900 transition-colors group"
                        style={col.headerAlign ? { justifyContent: col.headerAlign === 'center' ? 'center' : 'flex-start' } : undefined}
                      >
                        <span>{col.label}</span>
                        <span className={`inline-flex flex-col leading-none ${currentSort === col.key ? 'text-stone-700' : 'text-stone-500 group-hover:text-stone-600 transition-colors'}`}>
                          {currentSort === col.key && currentOrder === 'asc' ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          ) : currentSort === col.key && currentOrder === 'desc' ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="8 7 12 3 16 7" />
                              <polyline points="8 17 12 21 16 17" />
                            </svg>
                          )}
                        </span>
                      </Link>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={(row as Record<string, unknown>).id as string ?? i}>
                  {columns.map((col) => {
                    const value = (row as Record<string, unknown>)[col.key];
                    return (
                      <td key={col.key} className={col.cellClassName ?? ''} data-label={col.label} data-card-action={col.isAction ? '' : undefined} style={col.cellAlign ? { textAlign: col.cellAlign } : undefined}>
                        {col.render ? col.render(value, row) : String(value ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── フッター: 件数 + ページネーション ── */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <span className="text-sm text-stone-500">
          全 <strong className="text-stone-700">{totalCount}</strong> 件
          {currentQ && (
            <span className="ml-2 text-stone-400">
              （検索中: <strong>{currentQ}</strong>）
            </span>
          )}
        </span>
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} pageUrl={pageUrl} />
        )}
      </div>
    </div>
  );
}
