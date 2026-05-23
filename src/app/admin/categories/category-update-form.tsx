'use client';

import { useActionState, useMemo, useEffect } from 'react';
import {
  updateCategoryAction,
  type CategoryActionState,
} from '@/server/actions/categoryActions';
import { Loader2 } from 'lucide-react';
import { getCategoryLabel } from '@/lib/clientCategoryUtils';

const initialState: CategoryActionState = {
  error: null,
  success: null,
};

export function CategoryUpdateForm({
  category,
  categories,
  onSuccess,
}: {
  category: { id: number; name: string; parentId: number | null };
  categories: Array<{ id: number; name: string; parentId: number | null }>;
  onSuccess?: () => void;
}) {
  const [state, action, isPending] = useActionState(updateCategoryAction, initialState);

  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  // フロント側で親パス付きラベルを生成
  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.id, getCategoryLabel(c.id, categories)]),
      ),
    [categories],
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={category.id} />

      {/* 現在の情報 */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-bold">
            {category.name.charAt(0)}
          </div>
          <div>
            <span className="text-sm font-bold text-stone-800">{category.name}</span>
            <span className="text-[10px] text-stone-400 ml-2 font-mono">id: {category.id}</span>
          </div>
        </div>
      </div>

      {/* カテゴリ名 */}
      <div className="space-y-1.5">
        <label htmlFor={`cat-name-${category.id}`} className="field-label">
          カテゴリ名 <span className="text-red-500">*</span>
        </label>
        <input
          id={`cat-name-${category.id}`}
          name="name"
          type="text"
          required
          defaultValue={category.name}
          className="field-input"
        />
      </div>

      {/* 親カテゴリ */}
      <div className="space-y-1.5">
        <label htmlFor={`cat-parent-${category.id}`} className="field-label">親カテゴリ</label>
        <select
          id={`cat-parent-${category.id}`}
          name="parentId"
          defaultValue={category.parentId ?? ''}
          className="field-select"
        >
          <option value="">なし（トップレベル）</option>
          {categories
            .filter((option) => option.id !== category.id)
            .map((option) => (
              <option key={option.id} value={option.id}>
                {categoryLabels[option.id] ?? option.name}
              </option>
            ))}
        </select>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{
            padding: '0.5rem 1rem',
            background: '#f59e0b',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.875rem',
            borderRadius: '0.875rem',
            boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.3)',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> 保存中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
              更新する
            </>
          )}
        </button>
      </div>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {state.success}
        </div>
      )}
    </form>
  );
}
