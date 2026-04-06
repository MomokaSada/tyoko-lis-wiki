'use client';

import { useActionState } from 'react';
import {
  createCategoryAction,
  type CategoryActionState,
} from '@/server/actions/categoryActions';

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
    <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: '30rem' }}>
      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>カテゴリ名</span>
        <input name="name" type="text" required />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>親カテゴリ</span>
        <select name="parentId" defaultValue="">
          <option value="">親カテゴリなし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
        {isPending ? '作成中...' : 'カテゴリを作成する'}
      </button>

      {state.error && <p style={{ color: '#b00020' }}>{state.error}</p>}
      {state.success && <p style={{ color: '#0a7d22' }}>{state.success}</p>}
    </form>
  );
}
