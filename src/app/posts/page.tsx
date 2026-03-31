import { searchPublishedContentList } from '@/server/services/contentService';

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const query = typeof sp.q === 'string' ? sp.q : '';
  const session = typeof sp.session === 'string' ? sp.session : '';
  const posts = await searchPublishedContentList(query);

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
        記事一覧
      </h1>

      <form method="get" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {session && <input type="hidden" name="session" value={session} />}
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="タイトル・本文・スラッグで検索"
          style={{ minWidth: '20rem' }}
        />
        <button type="submit">検索</button>
      </form>

      {posts.length === 0 ? (
        <p>{query ? '検索条件に一致する記事はありません。' : '公開中の記事はまだありません。'}</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {posts.map((post) => (
            <article key={post.id} style={{ border: '1px solid #ddd', padding: '1rem', background: '#fff' }}>
              <p><strong>タイトル:</strong> {post.title}</p>
              <p><strong>スラッグ:</strong> <code>{post.slug}</code></p>
              <p><strong>閲覧数:</strong> {post.viewCount}</p>
              <p><strong>抜粋:</strong> {post.excerpt}</p>
              <p><strong>最終更新:</strong> {post.updatedAt.toISOString()}</p>
              <a
                href={session ? `/posts/${post.slug}?session=${encodeURIComponent(session)}` : `/posts/${post.slug}`}
                style={{ color: 'blue' }}
              >
                詳細を見る
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
