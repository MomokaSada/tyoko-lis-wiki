import { requireAccountCreateSession } from '@/lib/auth/guards';

export default async function AccountRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const sessionToken = typeof sp.session === 'string' ? sp.session : null;
  
  // Guard 実行: NG ならリダイレクトされる (Admin/Ownerなら/ホームに飛ぶ)
  const { valid, token } = await requireAccountCreateSession(sessionToken);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>アカウント本登録 (/auth/register)</h1>
      <p>ここにアカウント登録フォームが入ります。</p>
      <div style={{ padding: '1rem', background: '#f0f0f0', marginTop: '1rem' }}>
        <p><strong>Guard 検証:</strong> {valid ? 'OK' : 'NG'}</p>
        <p><strong>有効な招待トークン:</strong> {token}</p>
      </div>
      <br/>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
    </main>
  );
}
