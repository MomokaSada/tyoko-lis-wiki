import { requireEditSession } from '@/lib/auth/guards';

export default async function ModifyPostPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const sessionToken = typeof sp.session === 'string' ? sp.session : null;
  
  // Guard 実行: NG ならリダイレクトされる
  const { valid, user, token } = await requireEditSession(sessionToken);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>記事編集プレースホルダー</h1>
      <p>ここにエディタUIが入ります。</p>
      <div style={{ padding: '1rem', background: '#f0f0f0', marginTop: '1rem' }}>
        <p><strong>Guard 検証:</strong> {valid ? 'OK' : 'NG'}</p>
        <p><strong>ログインユーザー ロール:</strong> {user ? user.role : '未ログイン (招待トークン利用)'}</p>
        <p><strong>トークン:</strong> {token || 'なし'}</p>
      </div>
      <br/>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
    </main>
  );
}
