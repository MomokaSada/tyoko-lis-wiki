export default function ServerErrorPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ color: 'red' }}>500 - Internal Server Error</h1>
      <p>サーバー内部でエラーが発生しました。時間をおいて再度お試しください。</p>
      <a href="/" style={{ color: 'blue' }}>ホームに戻る</a>
    </main>
  );
}
