import React from 'react';
import { Filter } from 'lucide-react';

interface PostsStatusBarProps {
  query: string;
  categoryId?: number;
  totalCount: number;
}

/**
 * 項目一覧ページのフィルタリングステータスバー
 * 現在の検索条件と総件数を表示する
 */
export function PostsStatusBar({ query, categoryId, totalCount }: PostsStatusBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-10 bg-white border border-stone-200 p-3.5 md:p-4 rounded-[1.25rem] shadow-md">
      <div className="flex items-center gap-4 text-sm font-bold text-stone-500 px-2">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span>表示中:</span>
        </div>
        <span className="text-stone-900 bg-stone-100 px-3 py-1 rounded-full text-xs">
          {query ? `「${query}」の検索結果` : categoryId ? `カテゴリ #${categoryId} の項目` : 'すべての項目'}
        </span>
        <span className="text-stone-400">|</span>
        <span className="text-stone-600 italic">全 {totalCount} 件</span>
      </div>
    </div>
  );
}
