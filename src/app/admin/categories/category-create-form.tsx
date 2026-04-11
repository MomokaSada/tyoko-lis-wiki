'use client';

import { useActionState } from 'react';
import {
  createCategoryAction,
  type CategoryActionState,
} from '@/server/actions/categoryActions';
import { Loader2, Plus } from 'lucide-react';

const initialState: CategoryActionState = {
  error: null,
  success: null,
};

export function CategoryCreateForm({
  categories,
}: {
  categories: Array<{ id: number; label: string }>;
}) {
  const [state, action, isPending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={action} className="grid gap-4 max-w-lg">
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-stone-600">カテゴリ名</span>
        <input
          name="name"
          type="text"
          required
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          placeholder="例: お知らせ"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-stone-600">親カテゴリ</span>
        <select
          name="parentId"
          defaultValue=""
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
        >
          <option value="">親カテゴリなし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-stone-400">親子関係は後から変更できます。</span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed w-fit"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> 作成中...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" /> カテゴリを作成
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
