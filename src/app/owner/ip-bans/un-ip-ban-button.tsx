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
      {state.error && (
        <p className="text-xs text-amber-600 mb-1">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="btn-ghost"
        style={{ color: '#059669', fontWeight: 700 }}
      >
        {isPending ? '解除中...' : '解除'}
      </button>
    </form>
  );
}
