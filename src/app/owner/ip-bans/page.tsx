import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/server/lib/formatDateTime';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { deactivateIpBanAction } from '@/server/actions/ipBanActions';
import { IpBanForm } from './ip-ban-form';

export default async function IpBansPage() {
  const actor = await getCurrentActor();
  const bans = actor ? await getActiveIpBans(actor) : [];
  const records = actor ? await getIpDeviceRecords(actor) : [];
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
                <p><strong>登録日時:</strong> {formatDateTimeJst(ban.createdAt)}</p>
                <form action={deactivateIpBanAction} style={{ marginTop: '0.75rem' }}>
                  <input type="hidden" name="banId" value={ban.id} />
                  <button type="submit" style={{ padding: '0.4rem 0.75rem' }}>
                    IPBANを解除する
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          IP 記録一覧
        </h2>

        {!isOwner ? (
          <p>owner 権限を持つユーザーのみ一覧を確認できます。</p>
        ) : records.length === 0 ? (
          <p>記録された IP はまだありません。</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {records.map((record) => (
              <article
                key={record.deviceId}
                style={{ border: '1px solid #ddd', padding: '1rem', background: '#fff' }}
              >
                <p><strong>状態:</strong> {record.isBanned ? 'BAN中' : '未BAN'}</p>
                <p><strong>IP:</strong> {record.ip}</p>
                <p><strong>ブラウザ:</strong> {record.browser}</p>
                <p><strong>初回記録:</strong> {formatDateTimeJst(record.firstSeenAt)}</p>
                <p><strong>最終記録:</strong> {formatDateTimeJst(record.lastSeenAt)}</p>
                {record.isBanned ? (
                  <>
                    <p><strong>BAN理由:</strong> {record.banReason}</p>
                    <p><strong>BAN実行者:</strong> {record.bannedByName ?? `user:${record.bannedBy}`}</p>
                    <p><strong>BAN日時:</strong> {record.bannedAt ? formatDateTimeJst(record.bannedAt) : '不明'}</p>
                  </>
                ) : (
                  <p><strong>BAN情報:</strong> なし</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
