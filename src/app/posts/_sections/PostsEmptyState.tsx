import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface PostsEmptyStateProps {
  query: string;
  categoryId?: number;
}

/**
 * 項目一覧ページの空状態表示
 * 検索結果が0件の場合の案内を表示する
 */
export function PostsEmptyState({ query, categoryId }: PostsEmptyStateProps) {
  return (
    <div className="text-center py-20 md:py-24 bg-white border border-stone-200 rounded-[2.25rem] shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
        <AlertCircle className="w-10 h-10 text-stone-300" />
      </div>
      <h3 className="text-xl md:text-2xl font-black text-stone-800 mb-3 tracking-tighter">項目が見つかりません</h3>
      <p className="text-stone-500 font-medium max-w-md mx-auto leading-relaxed">
        {query
          ? `「${query}」に一致する項目はありませんでした。キーワードを変えてお試しください。`
          : categoryId
            ? 'このカテゴリにはまだ項目がありません。'
            : '現在、表示できる項目がありません。'}
      </p>
      {(query || categoryId) && (
        <Link href="/posts" className="mt-8 inline-flex items-center gap-2 text-amber-600 font-black hover:gap-3 transition-all">
          検索をリセット <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}
