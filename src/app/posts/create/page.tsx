import { requireEditSession } from '@/lib/auth/guards';
import { CreatePostForm } from './create-post-form';

export default async function CreatePostPage({
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
      <h1>記事作成</h1>
      <p>有効なログイン状態、または編集リンクを使って新規記事を作成します。</p>
      <div style={{ padding: '1rem', background: '#f0f0f0', marginTop: '1rem' }}>
        <p><strong>Guard 検証:</strong> {valid ? 'OK' : 'NG'}</p>
        <p><strong>ログインユーザー ロール:</strong> {user ? user.role : '未ログイン (招待トークン利用)'}</p>
        <p><strong>トークン:</strong> {token || 'なし'}</p>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <CreatePostForm sessionToken={token ?? null} />
      </div>
      <br/>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
    </main>
  );
}
