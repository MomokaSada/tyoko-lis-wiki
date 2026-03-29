import { headers } from 'next/headers';

export default async function AdminPage() {
  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  return (
    <main style={{ padding: '2rem' }}>
      <h1>管理画面 (/admin)</h1>
      <p>このページは role: admin 以上のユーザーのみアクセス可能です。</p>
      <div style={{ padding: '1rem', background: '#f0f0f0', marginTop: '1rem' }}>
        <strong>あなたのロール (Proxyから付与): </strong> {userRole || 'なし'}
      </div>
      <br/>
      <a href="/admin/account-create-links" style={{ color: 'blue', display: 'inline-block', marginRight: '1rem' }}>
        アカウント作成リンク生成へ
      </a>
      <a href="/admin/edit-links" style={{ color: 'blue', display: 'inline-block', marginRight: '1rem' }}>
        記事編集リンク管理へ
      </a>
      <a href="/admin/ip-bans" style={{ color: 'blue', display: 'inline-block', marginRight: '1rem' }}>
        IP BAN 管理へ
      </a>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
    </main>
  );
}
