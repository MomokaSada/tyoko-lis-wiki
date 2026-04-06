'use client';

import { useActionState } from 'react';
import {
  createIpBanAction,
  type CreateIpBanActionState,
} from '@/server/actions/ipBanActions';

const initialState: CreateIpBanActionState = {
  error: null,
  bannedIp: null,
  reason: null,
};

export function IpBanForm() {
  const [state, action, isPending] = useActionState(createIpBanAction, initialState);

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        IP BAN 登録
      </h2>

      <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: '32rem' }}>
        <input name="ip" type="text" placeholder="127.0.0.1" required />
        <input name="browser" type="text" placeholder="Chrome / manual" required defaultValue="manual" />
        <textarea name="reason" rows={4} placeholder="BAN理由" required />
        <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
          {isPending ? '登録中...' : 'IPをBANする'}
        </button>
      </form>

      {state.error && <p style={{ color: '#b00020', marginTop: '0.75rem' }}>{state.error}</p>}

      {state.bannedIp && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>BAN済みIP:</strong> {state.bannedIp}</p>
          <p><strong>理由:</strong> {state.reason}</p>
        </div>
      )}
    </section>
  );
}
