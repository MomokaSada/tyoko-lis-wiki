'use client';

import { useActionState } from 'react';
import {
  createEditLinkAction,
  type CreateEditLinkActionState,
} from '@/server/actions/editLinkActions';

const initialState: CreateEditLinkActionState = {
  error: null,
  generatedUrl: null,
  expiresAt: null,
  maxEdits: null,
};

export function EditLinkForm() {
  const [state, action, isPending] = useActionState(createEditLinkAction, initialState);

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        新しい記事編集リンクを発行
      </h2>

      <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: '24rem' }}>
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span>有効期限（分）</span>
          <input name="expiresInMinutes" type="number" min={5} max={10080} defaultValue={60} />
        </label>

        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span>編集可能回数</span>
          <input name="maxEdits" type="number" min={1} max={500} defaultValue={50} />
        </label>

        <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
          {isPending ? '生成中...' : '編集リンクを生成'}
        </button>
      </form>

      {state.error && <p style={{ color: '#b00020', marginTop: '0.75rem' }}>{state.error}</p>}

      {state.generatedUrl && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>生成されたリンク:</strong> <code>{process.env.NEXT_PUBLIC_APP_URL}{state.generatedUrl}</code></p>
          <p><strong>有効期限:</strong> {state.expiresAt}</p>
          <p><strong>編集可能回数:</strong> {state.maxEdits}</p>
        </div>
      )}
    </section>
  );
}
