'use client';

import { useActionState } from 'react';
import { deactivateIpBanAction } from '@/server/actions/ipBanActions';

export function UnIpBanButton({ banId }: { banId: number }) {
  const [state, formAction, isPending] = useActionState(deactivateIpBanAction, {
    error: null,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="banId" value={banId} />
      {state.error && <p style={{ color: '#b45309' }}>{state.error}</p>}
      <button type="submit" style={{ padding: '0.4rem 0.75rem' }} disabled={isPending}>
        IPBANを解除する
      </button>
    </form>
  );
}