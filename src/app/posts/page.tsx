import { getPublishedContentList } from '@/server/services/contentService';

export default async function PostsPage() {
  const posts = await getPublishedContentList();

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
        記事一覧
      </h1>

      {posts.length === 0 ? (
        <p>公開中の記事はまだありません。</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {posts.map((post) => (
            <article key={post.id} style={{ border: '1px solid #ddd', padding: '1rem', background: '#fff' }}>
              <p><strong>タイトル:</strong> {post.title}</p>
              <p><strong>スラッグ:</strong> <code>{post.slug}</code></p>
              <p><strong>抜粋:</strong> {post.excerpt}</p>
              <p><strong>最終更新:</strong> {post.updatedAt.toISOString()}</p>
              <a href={`/posts/${post.slug}`} style={{ color: 'blue' }}>
                詳細を見る
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
