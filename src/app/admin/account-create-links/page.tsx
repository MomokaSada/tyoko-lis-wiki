import { AccountCreateLinkForm } from './account-create-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getAccountCreateLinks } from '@/server/services/accountCreateLinkService';

function getStatusLabel(status: 'active' | 'expired' | 'inactive') {
  switch (status) {
    case 'active':
      return '有効';
    case 'expired':
      return '期限切れ';
    case 'inactive':
      return '無効化済み';
  }
}

export default async function AccountCreateLinksPage() {
  const actor = await getCurrentActor();
  const links = actor ? await getAccountCreateLinks(actor) : [];

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        アカウント作成リンク管理
      </h1>

      <AccountCreateLinkForm />

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          発行済みリンク一覧
        </h2>

        {links.length === 0 ? (
          <p>まだ発行されたリンクはありません。</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {links.map((link) => (
              <article
                key={link.uuid}
                style={{ border: '1px solid #ddd', padding: '1rem', background: '#fff' }}
              >
                <p><strong>UUID:</strong> <code>{link.uuid}</code></p>
                <p><strong>状態:</strong> {getStatusLabel(link.status)}</p>
                <p><strong>発行者:</strong> {link.authorName ?? `user:${link.authorId}`}</p>
                <p><strong>開始:</strong> {link.startAt.toISOString()}</p>
                <p><strong>終了:</strong> {link.endAt.toISOString()}</p>
                <p><strong>作成:</strong> {link.createdAt.toISOString()}</p>
                <p>
                  <strong>リンク:</strong>{' '}
                  <code>{`/auth/register?session=${link.uuid}`}</code>
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
