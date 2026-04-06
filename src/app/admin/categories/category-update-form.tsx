'use client';

import { useActionState } from 'react';
import {
  updateCategoryAction,
  type CategoryActionState,
} from '@/server/actions/categoryActions';

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
    <form action={action} style={{ display: 'grid', gap: '0.5rem', border: '1px solid #ddd', padding: '0.75rem' }}>
      <input type="hidden" name="id" value={category.id} />

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>カテゴリ名</span>
        <input name="name" type="text" required defaultValue={category.name} />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>親カテゴリ</span>
        <select name="parentId" defaultValue={category.parentId ?? ''}>
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

      <div>
        <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.4rem 0.9rem' }}>
          {isPending ? '保存中...' : '更新する'}
        </button>
      </div>

      <p style={{ margin: 0, color: '#666' }}>
        現在の表示: {category.label}
      </p>
      {state.error && <p style={{ margin: 0, color: '#b00020' }}>{state.error}</p>}
      {state.success && <p style={{ margin: 0, color: '#0a7d22' }}>{state.success}</p>}
    </form>
  );
}
