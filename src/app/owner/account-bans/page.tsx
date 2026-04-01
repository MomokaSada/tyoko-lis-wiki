import { banAccountAction } from '@/server/actions/accountBanActions';
import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/server/lib/formatDateTime';
import { getManageableAccounts } from '@/server/services/accountBanService';

export default async function AccountBansPage() {
  const actor = await getCurrentActor();
  const accounts = actor ? await getManageableAccounts(actor) : [];
  const isOwner = actor?.role === 'owner';

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        アカウントBAN管理
      </h1>

      {!isOwner ? (
        <p style={{ color: '#b45309' }}>この機能は owner のみ利用できます。</p>
      ) : accounts.length === 0 ? (
        <p>BAN対象のアカウントはありません。</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {accounts.map((account) => (
            <article key={account.id} style={{ border: '1px solid #ddd', padding: '1rem', background: '#fff' }}>
              <p><strong>ユーザー名:</strong> {account.name}</p>
              <p><strong>種別:</strong> {account.type}</p>
              <p><strong>状態:</strong> {account.isActive ? '有効' : 'BAN済み'}</p>
              <p><strong>作成日時:</strong> {formatDateTimeJst(account.createdAt)}</p>
              {account.isActive && (
                <form action={banAccountAction} style={{ marginTop: '0.75rem' }}>
                  <input type="hidden" name="userId" value={account.id} />
                  <button type="submit" style={{ padding: '0.4rem 0.75rem' }}>
                    アカウントをBANする
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
