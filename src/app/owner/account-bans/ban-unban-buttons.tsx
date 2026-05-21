'use client';

import { useActionState } from 'react';
import { banAccountAction, unbanAccountAction, type BanAccountActionState } from '@/server/actions/accountBanActions';

const initialState: BanAccountActionState = {
  error: null,
};

export function BanButton({ userId }: { userId: number }) {
  const [state, formAction, isPending] = useActionState(banAccountAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      {state.error && (
        <p className="text-xs text-amber-600 mb-1">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="btn-ghost-danger btn-sm"
      >
        {isPending ? '処理中...' : 'BANする'}
      </button>
    </form>
  );
}

export function UnbanButton({ userId }: { userId: number }) {
  const [state, formAction, isPending] = useActionState(unbanAccountAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
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
