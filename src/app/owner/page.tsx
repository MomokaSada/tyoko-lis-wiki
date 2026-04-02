import { headers } from 'next/headers';
import { OrphanThumbnailCleanupForm } from './orphan-thumbnail-cleanup-form';

export default async function OwnerPage() {
  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  return (
    <main style={{ padding: '2rem' }}>
      <h1>オーナー画面 (/owner)</h1>
      <p>このページは role: owner のユーザーのみアクセス可能です。</p>
      <div style={{ padding: '1rem', background: '#f0f0f0', marginTop: '1rem' }}>
        <strong>あなたのロール (Proxyから付与): </strong> {userRole || 'なし'}
      </div>
      <br/>
      <a href="/owner/account-create-links" style={{ color: 'blue', display: 'inline-block', marginRight: '1rem' }}>
        アカウント作成リンク生成へ
      </a>
      <a href="/owner/account-bans" style={{ color: 'blue', display: 'inline-block', marginRight: '1rem' }}>
        アカウントBAN管理へ
      </a>
      <a href="/owner/ip-bans" style={{ color: 'blue', display: 'inline-block', marginRight: '1rem' }}>
        IPアドレスBAN管理へ
      </a>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
      <OrphanThumbnailCleanupForm />
    </main>
  );
}
