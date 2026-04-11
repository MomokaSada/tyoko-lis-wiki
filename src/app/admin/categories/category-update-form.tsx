'use client';

import { useActionState } from 'react';
import {
  updateCategoryAction,
  type CategoryActionState,
} from '@/server/actions/categoryActions';
import { Loader2, Save } from 'lucide-react';

const initialState: CategoryActionState = {
  error: null,
  success: null,
};

export function CategoryUpdateForm({
  category,
  categories,
}: {
  category: { id: number; name: string; parentId: number | null; label: string };
  categories: Array<{ id: number; label: string }>;
}) {
  const [state, action, isPending] = useActionState(updateCategoryAction, initialState);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={category.id} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-stone-500">ID</div>
          <div className="font-mono text-xs text-stone-600">{category.id}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-stone-500">現在の表示</div>
          <div className="text-xs font-bold text-stone-800">{category.label}</div>
        </div>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-stone-600">カテゴリ名</span>
        <input
          name="name"
          type="text"
          required
          defaultValue={category.name}
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-stone-600">親カテゴリ</span>
        <select
          name="parentId"
          defaultValue={category.parentId ?? ''}
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        >
          <option value="">親カテゴリなし</option>
          {categories
            .filter((option) => option.id !== category.id)
            .map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed w-fit"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> 保存中...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> 更新する
          </>
        )}
      </button>

      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {state.success}
        </div>
      )}
    </form>
  );
}
