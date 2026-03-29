import { notFound } from 'next/navigation';
import { getPublishedContentDetail } from '@/server/services/contentService';

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const post = await getPublishedContentDetail(slug);

  if (!post) {
    notFound();
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '60rem' }}>
      <article style={{ display: 'grid', gap: '1rem' }}>
        <header>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>{post.title}</h1>
          <p><strong>スラッグ:</strong> <code>{post.slug}</code></p>
          <p><strong>リビジョン:</strong> {post.latestRevision ?? 1}</p>
          <p><strong>閲覧数:</strong> {post.viewCount}</p>
          <p><strong>最終更新:</strong> {post.updatedAt.toISOString()}</p>
        </header>

        <div>
          <p><strong>サムネイルURL:</strong> {post.thumbnail}</p>
        </div>

        <section style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {post.content}
        </section>

        <a href="/posts" style={{ color: 'blue' }}>
          記事一覧に戻る
        </a>
      </article>
    </main>
  );
}
