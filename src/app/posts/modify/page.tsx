import { requireEditSession } from '@/lib/auth/guards';
import { getEditableContentDetail } from '@/server/services/contentService';
import { EditPostForm } from './edit-post-form';

export default async function ModifyPostPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const sessionToken = typeof sp.session === 'string' ? sp.session : null;
  const slug = typeof sp.slug === 'string' ? sp.slug : null;
  
  // Guard 実行: NG ならリダイレクトされる
  const { valid, user, token } = await requireEditSession(sessionToken);
  const content = slug ? await getEditableContentDetail(slug) : null;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>記事編集</h1>
      <p>編集対象のスラッグを指定して記事を更新します。</p>
      <div style={{ padding: '1rem', background: '#f0f0f0', marginTop: '1rem' }}>
        <p><strong>Guard 検証:</strong> {valid ? 'OK' : 'NG'}</p>
        <p><strong>ログインユーザー ロール:</strong> {user ? user.role : '未ログイン (招待トークン利用)'}</p>
        <p><strong>トークン:</strong> {token || 'なし'}</p>
      </div>
      <form method="get" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
        {sessionToken && <input type="hidden" name="session" value={sessionToken} />}
        <input type="text" name="slug" defaultValue={slug ?? ''} placeholder="編集したい記事のスラッグ" />
        <button type="submit">読み込む</button>
      </form>
      {content ? (
        <div style={{ marginTop: '1.5rem' }}>
          <EditPostForm sessionToken={token ?? null} content={content} />
        </div>
      ) : (
        <p style={{ marginTop: '1rem' }}>編集対象の slug を指定するとフォームが表示されます。</p>
      )}
      <br/>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
    </main>
  );
}
