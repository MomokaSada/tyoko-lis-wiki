'use client';

import { useActionState } from 'react';
import {
  updateContentAction,
  type UpdateContentActionState,
} from '@/server/actions/contentActions';

const initialState: UpdateContentActionState = {
  error: null,
  updatedSlug: null,
  updatedTitle: null,
};

export function EditPostForm({
  sessionToken,
  canPublish,
  content,
}: {
  sessionToken: string | null;
  canPublish: boolean;
  content: {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail: string;
    isPublished: boolean;
  };
}) {
  const [state, action, isPending] = useActionState(updateContentAction, initialState);

  return (
    <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: '48rem' }}>
      <input type="hidden" name="session" value={sessionToken ?? ''} />
      <input type="hidden" name="contentId" value={content.id} />

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>タイトル</span>
        <input name="title" type="text" required defaultValue={content.title} />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>スラッグ</span>
        <input name="slug" type="text" required defaultValue={content.slug} />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>サムネイルURL</span>
        <input name="thumbnail" type="url" required defaultValue={content.thumbnail} />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>本文</span>
        <textarea name="content" rows={12} required defaultValue={content.content} />
      </label>

      {canPublish ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input name="isPublished" type="checkbox" defaultChecked={content.isPublished} />
          <span>公開状態</span>
        </label>
      ) : (
        <p style={{ margin: 0, color: '#555' }}>
          編集セッション経由では公開状態を変更できません。
        </p>
      )}

      <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
        {isPending ? '保存中...' : '記事を更新する'}
      </button>

      {state.error && <p style={{ color: '#b00020' }}>{state.error}</p>}

      {state.updatedSlug && (
        <div style={{ padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>更新完了:</strong> {state.updatedTitle}</p>
          <p><strong>スラッグ:</strong> <code>{state.updatedSlug}</code></p>
        </div>
      )}
    </form>
  );
}
