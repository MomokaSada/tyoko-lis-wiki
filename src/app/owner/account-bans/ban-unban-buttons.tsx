'use client';

import { useActionState } from 'react';
import { banAccountAction, unbanAccountAction, type BanAccountActionState, } from '@/server/actions/accountBanActions';

const initialState: BanAccountActionState = {
  error: null,
};

export function BanButton({ userId }: { userId: number }) {
  const [state, formAction, isPending] = useActionState(banAccountAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      {state.error && <p style={{ color: '#b45309' }}>{state.error}</p>}
      <button type="submit" style={{ padding: '0.4rem 0.75rem' }} disabled={isPending}>
        アカウントBAN
      </button>
    </form>
  );
}

export function UnbanButton({ userId }: { userId: number }) {
  const [state, formAction, isPending] = useActionState(unbanAccountAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      {state.error && <p style={{ color: '#b45309' }}>{state.error}</p>}
      <button type="submit" style={{ padding: '0.4rem 0.75rem' }} disabled={isPending}>
        アカウントBANを解除する
      </button>
    </form>
  );
}