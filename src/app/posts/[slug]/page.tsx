import { notFound } from 'next/navigation';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { getAccessibleContentDetail } from '@/server/services/contentService';

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const session = typeof sp.session === 'string' ? sp.session : null;
  const showPrivate = sp.showPrivate === '1';
  const backParams = new URLSearchParams();
  if (session) backParams.set('session', session);
  if (showPrivate) backParams.set('showPrivate', '1');
  const postsIndexHref = `/posts${backParams.toString() ? `?${backParams.toString()}` : ''}`;
  const editor = await getCurrentEditor(session);
  const post = await getAccessibleContentDetail(slug, editor);

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
          {'isPublished' in post && <p><strong>状態:</strong> {post.isPublished ? '公開' : '非公開'}</p>}
          <p><strong>閲覧数:</strong> {post.viewCount}</p>
          <p><strong>最終更新:</strong> {post.updatedAt.toISOString()}</p>
        </header>

        <div>
          <p><strong>サムネイルURL:</strong> {post.thumbnail}</p>
        </div>

        <section style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {post.content}
        </section>

        {editor && (
          <a
            href={
              editor.type === 'session'
                ? `/posts/modify?slug=${post.slug}&session=${encodeURIComponent(editor.sessionId)}`
                : `/posts/modify?slug=${post.slug}`
            }
            style={{ color: 'blue' }}
          >
            この記事を編集する
          </a>
        )}

        <a href={postsIndexHref} style={{ color: 'blue' }}>
          {showPrivate ? '非公開込みの記事一覧に戻る' : '記事一覧に戻る'}
        </a>
      </article>
    </main>
  );
}
