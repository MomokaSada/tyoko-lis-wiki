'use client';

import { useActionState } from 'react';
import { deactivateAccountCreateLinkAction } from '@/server/actions/accountCreateLinkActions';
import { Loader2 } from 'lucide-react';

export function InvalidButton({ uuid }: { uuid: string }) {
  const [state, formAction, isPending] = useActionState(deactivateAccountCreateLinkAction, {
    error: null,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="uuid" value={uuid} />
      {state.error && (
        <p className="text-xs text-amber-600 mb-1">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-bold text-red-600 hover:text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition-all border border-red-200 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
      >
        {isPending ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            失効中...
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            失効
          </>
        )}
      </button>
    </form>
  );
}
