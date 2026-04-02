'use client';

import { useActionState } from 'react';
import {
  cleanupOrphanThumbnailsAction,
  type ThumbnailCleanupActionState,
} from '@/server/actions/thumbnailActions';

const initialState: ThumbnailCleanupActionState = {
  error: null,
  deletedCount: 0,
  scannedCount: 0,
  referencedCount: 0,
  minAgeHours: 24,
};

export function OrphanThumbnailCleanupForm() {
  const [state, formAction, isPending] = useActionState(
    cleanupOrphanThumbnailsAction,
    initialState,
  );

  return (
    <section
      style={{
        marginTop: '2rem',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        background: '#fafafa',
      }}
    >
      <h2 style={{ marginTop: 0 }}>未使用サムネイル掃除</h2>
      <p style={{ marginTop: '0.5rem' }}>
        参照されていないサムネイル画像のうち、{state.minAgeHours}時間以上前にアップロードされたものだけ削除します。
      </p>
      <form action={formAction}>
        <button type="submit" disabled={isPending}>
          {isPending ? '掃除中...' : '未使用サムネイルを掃除する'}
        </button>
      </form>
      {state.error ? (
        <p style={{ color: '#b00020' }}>{state.error}</p>
      ) : state.scannedCount > 0 ? (
        <p style={{ color: '#166534' }}>
          走査: {state.scannedCount}件 / 参照中: {state.referencedCount}件 / 削除: {state.deletedCount}件
        </p>
      ) : null}
    </section>
  );
}
