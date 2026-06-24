'use client';

import { useState, useActionState } from 'react';
import { createCategoryAction } from '@/server/actions/categoryActions';
import type { CategoryActionState } from '@/server/actions/categoryActions';
import { Loader2 } from 'lucide-react';
import { CategorySearchPicker } from '@/components/ui/CategorySearchPicker';

const initialState: CategoryActionState = {
  error: null,
  success: null,
};

export function CategoryCreateForm({
  categories,
}: {
  categories: Array<{ id: number; name: string; parentId: number | null }>;
}) {
  const [state, action, isPending] = useActionState(createCategoryAction, initialState);
  const [parentId, setParentId] = useState<number | null>(null);

  return (
    <form action={action} className="space-y-6">
      {/* カテゴリ名 */}
      <div className="space-y-1.5">
        <label htmlFor="cat-name" className="field-label">
          カテゴリ名 <span className="text-red-500">*</span>
        </label>
        <input
          id="cat-name"
          name="name"
          type="text"
          required
          placeholder="例: 技術・エンジニアリング"
          className="field-input"
        />
      </div>

      {/* 親カテゴリ */}
      <div className="space-y-1.5">
        <label className="field-label">親カテゴリ</label>
        <CategorySearchPicker
          categories={categories}
          value={parentId}
          onChange={setParentId}
          name="parentId"
        />
        <p className="field-hint" style={{ fontSize: '0.6875rem', color: '#a8a29e', marginTop: '0.375rem' }}>
          親カテゴリを選択すると、このカテゴリは子カテゴリとして登録されます
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
          style={{
            padding: '0.625rem 1.25rem',
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
              保存する
            </>
          )}
        </button>
        <button type="button" className="btn-outline">キャンセル</button>
      </div>

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
