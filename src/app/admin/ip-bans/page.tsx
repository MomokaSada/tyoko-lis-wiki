import { getCurrentActor } from '@/server/lib/currentActor';
import { getActiveIpBans } from '@/server/services/ipBanService';
import { IpBanForm } from './ip-ban-form';

export default async function IpBansPage() {
  const actor = await getCurrentActor();
  const bans = actor ? await getActiveIpBans(actor) : [];
  const isOwner = actor?.role === 'owner';

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        IP BAN 管理
      </h1>

      {isOwner ? (
        <IpBanForm />
      ) : (
        <p style={{ marginBottom: '1.5rem', color: '#b45309' }}>
          この機能は owner のみ利用できます。
        </p>
      )}

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          有効な IP BAN 一覧
        </h2>

        {!isOwner ? (
          <p>owner 権限を持つユーザーのみ一覧を確認できます。</p>
        ) : bans.length === 0 ? (
          <p>有効なIP BANはまだありません。</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {bans.map((ban) => (
              <article key={ban.id} style={{ border: '1px solid #ddd', padding: '1rem', background: '#fff' }}>
                <p><strong>IP:</strong> {ban.ip}</p>
                <p><strong>ブラウザ:</strong> {ban.browser}</p>
                <p><strong>理由:</strong> {ban.reason}</p>
                <p><strong>登録者:</strong> {ban.blockedByName ?? `user:${ban.blockedBy}`}</p>
                <p><strong>登録日時:</strong> {ban.createdAt.toISOString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
