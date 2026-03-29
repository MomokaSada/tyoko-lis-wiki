'use client';

import { useActionState } from 'react';
import {
  createAccountCreateLinkAction,
  type CreateAccountCreateLinkActionState,
} from '@/server/actions/accountCreateLinkActions';

const initialState: CreateAccountCreateLinkActionState = {
  error: null,
  generatedUrl: null,
  expiresAt: null,
};

export function AccountCreateLinkForm() {
  const [state, action, isPending] = useActionState(
    createAccountCreateLinkAction,
    initialState,
  );

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        アカウント作成リンク生成
      </h2>

      <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
        <label htmlFor="expiresInMinutes">有効期限（分）</label>
        <input
          id="expiresInMinutes"
          name="expiresInMinutes"
          type="number"
          min={5}
          max={10080}
          defaultValue={60}
          style={{ padding: '0.5rem 0.75rem' }}
        />

        <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
          {isPending ? '生成中...' : 'リンク生成'}
        </button>
      </form>

      {state.error && (
        <p style={{ marginTop: '1rem', color: '#b91c1c' }}>
          {state.error}
        </p>
      )}

      {state.generatedUrl && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>生成されたリンク</strong></p>
          <code>{state.generatedUrl}</code>
          <p style={{ marginTop: '0.5rem' }}>
            有効期限: {state.expiresAt}
          </p>
        </div>
      )}
    </section>
  );
}
