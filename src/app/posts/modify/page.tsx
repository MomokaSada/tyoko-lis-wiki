import { requireEditSession } from '@/lib/auth/guards';
import { getEditableContentDetail, getTaxonomyOptions } from '@/server/services/contentService';
import { PostForm } from '@/components/features/posts/PostForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

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

  const backHref = content
    ? sessionToken
      ? `/posts/${encodeURIComponent(content.slug)}?session=${encodeURIComponent(sessionToken)}`
      : `/posts/${encodeURIComponent(content.slug)}`
    : '/posts';
  const taxonomy = await getTaxonomyOptions();

  // シリアライズエラーや BigInt、および不正な要素によるクラッシュを回避するため、極めて防御的にマッピングを行う
  const serializedTags = Array.isArray(taxonomy?.tags)
    ? taxonomy.tags.filter((t: any) => t && typeof t === 'object').map((t: any) => ({
      id: t.id,
      name: t.name || ''
    }))
    : [];

  const serializedCategories = Array.isArray(taxonomy?.categories)
    ? taxonomy.categories.filter((c: any) => c && typeof c === 'object').map((c: any) => ({
      id: c.id,
      name: c.name || '',
      parentId: c.parentId ?? null
    }))
    : [];

  return (
    <>
      {/* スティッキーヘッダー */}
      <header className="sticky top-16 md:top-20 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest truncate max-w-[200px]"
          >
            <ChevronLeft size={12} />
            {content?.title ?? '記事一覧'}に戻る
          </Link>
        </div>
      </header>

      {/* ページコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ページタイトル */}
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
            記事を編集
          </h2>
          <p className="text-sm text-stone-500 mt-1">内容を修正して更新しましょう</p>
        </div>

        {content ? (
          <PostForm
            mode="modify"
            sessionToken={token ?? null}
            canPublish={Boolean(user)}
            availableTags={serializedTags}
            availableCategories={serializedCategories}
            content={content}
          />
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-stone-200 bg-stone-50 rounded-3xl">
            <p className="text-stone-400 font-bold text-sm">編集対象の記事が見つかりませんでした</p>
            <p className="text-xs text-stone-300 mt-2">URLパラメータに正しい slug を指定してください</p>
          </div>
        )}
      </div>
    </>
  );
}
