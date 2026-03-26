export default function UnauthorizedPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ color: 'red' }}>403 - Unauthorized</h1>
      <p>アクセスする権限がないか、セッションが無効です。</p>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
    </main>
  );
}
