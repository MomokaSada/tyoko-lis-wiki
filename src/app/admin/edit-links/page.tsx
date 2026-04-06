import { EditLinkForm } from './edit-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getEditLinks } from '@/server/services/editLinkService';

function getStatusLabel(status: 'active' | 'expired' | 'inactive' | 'limit-reached') {
  switch (status) {
    case 'active':
      return '有効';
    case 'expired':
      return '期限切れ';
    case 'inactive':
      return '無効化済み';
    case 'limit-reached':
      return '上限到達';
  }
}

export default async function EditLinksPage() {
  const actor = await getCurrentActor();
  const links = actor ? await getEditLinks(actor) : [];

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        記事編集リンク管理
      </h1>

      <EditLinkForm />

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          発行済み編集リンク一覧
        </h2>

        {links.length === 0 ? (
          <p>まだ発行された編集リンクはありません。</p>
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
                <p><strong>編集回数:</strong> {link.editsUsed} / {link.maxEdits}</p>
                <p><strong>開始:</strong> {link.startAt.toISOString()}</p>
                <p><strong>終了:</strong> {link.endAt.toISOString()}</p>
                <p><strong>作成:</strong> {link.createdAt.toISOString()}</p>
                <p><strong>編集リンク:</strong> <code>{`${process.env.NEXT_PUBLIC_APP_URL}/posts/create?session=${link.uuid}`}</code></p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
