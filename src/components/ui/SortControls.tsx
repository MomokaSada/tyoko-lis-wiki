'use client';

import { useRouter } from 'next/navigation';
import type { SortOrder } from '@/types/listQuery';

export type SortOption = {
  key: string;
  label: string;
};

type Props = {
  basePath: string;
  options: SortOption[];
  currentSort: string;
  currentOrder: SortOrder;
  /** 追加のクエリパラメータ（例: q, status など） */
  extraParams?: Record<string, string>;
};

/**
 * カードスタイル一覧ページ向けのソートコントロール。
 * ツールバーに並び替えオプションをコンパクトに表示する。
 *
 * 使い方:
 * ```tsx
 * <SortControls
 *   basePath="/admin/edit-links"
 *   options={[
 *     { key: 'createdAt', label: '作成日' },
 *     { key: 'endAt', label: '期限' },
 *     { key: 'editsUsed', label: '使用回数' },
 *   ]}
 *   currentSort={currentSort}
 *   currentOrder={currentOrder}
 *   extraParams={{ q: currentQ, status: currentStatus }}
 * />
 * ```
 */
export function SortControls({ basePath, options, currentSort, currentOrder, extraParams }: Props) {
  const router = useRouter();

  function handleClick(key: string) {
    const order = currentSort === key && currentOrder === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        if (v) params.set(k, v);
      }
    }
    params.set('sort', key);
    params.set('order', order);
    params.set('page', '1');
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-medium text-stone-500 whitespace-nowrap">並び替え:</span>
      <div className="inline-flex items-center p-0.5 bg-stone-100/80 rounded-lg border border-stone-200/50">
        {options.map((opt) => {
          const isActive = currentSort === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleClick(opt.key)}
              className={[
                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-white text-stone-800 shadow-sm ring-1 ring-stone-200'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50',
              ].join(' ')}
            >
              {opt.label}
              <span className="inline-flex flex-col justify-center leading-none">
                {isActive && currentOrder === 'asc' ? (
                  <svg className="w-3 h-3 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : isActive && currentOrder === 'desc' ? (
                  <svg className="w-3 h-3 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="8 7 12 3 16 7" />
                    <polyline points="8 17 12 21 16 17" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
