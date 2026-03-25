export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Home / Wiki 記事一覧</h1>
      <p>このページは誰でもアクセス可能です。</p>
      <ul>
        <li><a href="/auth/login" style={{ color: 'blue' }}>ログインページへ (/auth/login)</a></li>
        <li><a href="/admin" style={{ color: 'blue' }}>管理画面 (Admin) へ</a></li>
        <li><a href="/owner" style={{ color: 'blue' }}>オーナー画面 (Owner) へ</a></li>
        <li><a href="/posts/create" style={{ color: 'blue' }}>記事作成へ (認証 or セッショントークン必要)</a></li>
        <li><a href="/auth/register" style={{ color: 'blue' }}>アカウント本登録へ (/auth/register)</a></li>
      </ul>
    </main>
  );
}
