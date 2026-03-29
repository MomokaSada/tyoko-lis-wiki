'use client';

import { useActionState } from 'react';
import {
  createContentAction,
  type CreateContentActionState,
} from '@/server/actions/contentActions';

const initialState: CreateContentActionState = {
  error: null,
  createdSlug: null,
  createdTitle: null,
};

export function CreatePostForm({ sessionToken }: { sessionToken: string | null }) {
  const [state, action, isPending] = useActionState(createContentAction, initialState);

  return (
    <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: '48rem' }}>
      <input type="hidden" name="session" value={sessionToken ?? ''} />

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>タイトル</span>
        <input name="title" type="text" required />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>スラッグ（未入力ならタイトルから自動生成）</span>
        <input name="slug" type="text" />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>サムネイルURL</span>
        <input name="thumbnail" type="url" required />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>本文</span>
        <textarea name="content" rows={12} required />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input name="isPublished" type="checkbox" />
        <span>公開状態で作成する</span>
      </label>

      <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
        {isPending ? '作成中...' : '記事を作成する'}
      </button>

      {state.error && <p style={{ color: '#b00020' }}>{state.error}</p>}

      {state.createdSlug && (
        <div style={{ padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>作成完了:</strong> {state.createdTitle}</p>
          <p><strong>スラッグ:</strong> <code>{state.createdSlug}</code></p>
        </div>
      )}
    </form>
  );
}
