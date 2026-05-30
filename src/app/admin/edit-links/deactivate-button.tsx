'use client';

import { useActionState } from 'react';
import { deactivateEditLinkAction } from '@/server/actions/editLinkActions';

export function DeactivateEditLinkButton({ uuid }: { uuid: string }) {
  const [state, formAction, isPending] = useActionState(deactivateEditLinkAction, { error: null });

  return (
    <form action={formAction}>
      <input type="hidden" name="uuid" value={uuid} />
      {state.error && (
        <p className="text-xs text-amber-600 mb-1">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="btn-ghost-danger btn-sm"
      >
        {isPending ? '処理中...' : '失効'}
      </button>
    </form>
  );
}
