'use client';

import { useActionState } from 'react';
import { deactivateAccountCreateLinkAction } from '@/server/actions/accountCreateLinkActions';

export function InvalidButton({ uuid }: { uuid: string }) {
  const [state, formAction, isPending] = useActionState(deactivateAccountCreateLinkAction, {
    error: null,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="uuid" value={uuid} />
      {state.error && <p style={{ color: '#b45309', fontSize: '0.875rem', marginTop: '0.25rem' }}>{state.error}</p>}
      <button
        type="submit"
        style={{ padding: '0.4rem 0.75rem' }}
        disabled={isPending}
      >
        {isPending ? '無効化中...' : '無効にする'}
      </button>
    </form>
  );
}
