'use client';

import { useActionState } from 'react';
import { banAccountAction, unbanAccountAction, type BanAccountActionState, } from '@/server/actions/accountBanActions';

const initialState: BanAccountActionState = {
  error: null,
};

export function BanButton({ userId }: { userId: number }) {
  const [state, formAction, isPending] = useActionState(banAccountAction, initialState);

  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="userId" value={userId} />
      {state.error && <p className="text-[10px] text-amber-600 font-bold mb-1">{state.error}</p>}
      <button 
        type="submit" 
        disabled={isPending}
        className="px-3 py-1.5 bg-red-100 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
      >
        {isPending ? '...' : 'BAN執行'}
      </button>
    </form>
  );
}

export function UnbanButton({ userId }: { userId: number }) {
  const [state, formAction, isPending] = useActionState(unbanAccountAction, initialState);

  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="userId" value={userId} />
      {state.error && <p className="text-[10px] text-amber-600 font-bold mb-1">{state.error}</p>}
      <button 
        type="submit" 
        disabled={isPending}
        className="px-3 py-1.5 bg-stone-100 text-stone-600 text-[10px] font-black rounded-lg hover:bg-stone-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
      >
        {isPending ? '...' : 'BAN解除'}
      </button>
    </form>
  );
}
