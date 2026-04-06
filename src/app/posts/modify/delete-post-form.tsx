'use client';

import { useActionState } from 'react';
import {
  deleteContentAction,
  type ContentActionState,
} from '@/server/actions/contentActions';

const initialState: ContentActionState = {
  error: null,
  slug: null,
  title: null,
};

export function DeletePostForm({ contentId }: { contentId: number }) {
  const [state, action, isPending] = useActionState(deleteContentAction, initialState);

  return (
    <form action={action} style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
      <input type="hidden" name="contentId" value={contentId} />

      <button
        type="submit"
        disabled={isPending}
        style={{ width: 'fit-content', padding: '0.5rem 1rem', background: '#b00020', color: '#fff' }}
      >
        {isPending ? '削除中...' : '記事を削除する'}
      </button>

      {state.error && <p style={{ color: '#b00020' }}>{state.error}</p>}

      {state.slug && (
        <div style={{ padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>削除完了:</strong> {state.title}</p>
          <p><strong>スラッグ:</strong> <code>{state.slug}</code></p>
        </div>
      )}
    </form>
  );
}
