import { toSafeId } from '@/lib/safe-id';
import { requireEditSession } from '@/lib/auth/guards';
import { getTaxonomyOptions } from '@/server/services/taxonomyService';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PostForm } from '@/components/features/posts/forms/PostForm';

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const sessionToken = typeof sp.session === 'string' ? sp.session : null;

  // Guard 実行: NG ならリダイレクトされる
  const { token, valid, user } = await requireEditSession(sessionToken);

  const homeHref = sessionToken ? `/?session=${encodeURIComponent(sessionToken)}` : '/';

  let taxonomy;
  try {
    taxonomy = await getTaxonomyOptions();
  } catch (error) {
    console.error('Failed to load taxonomy options:', error);
    taxonomy = { tags: [], categories: [] };
  }

  // シリアライズエラーや BigInt、および不正な要素によるクラッシュを回避するため、極めて防御的にマッピングを行う
  const serializedTags = Array.isArray(taxonomy?.tags)
    ? taxonomy.tags
      .filter((t: unknown): t is Record<string, unknown> => !!t && typeof t === 'object')
      .map((t) => ({
        id: toSafeId(t.id),
        name: typeof t.name === 'string' ? t.name : '',
      }))
    : [];

  const serializedCategories = Array.isArray(taxonomy?.categories)
    ? taxonomy.categories
      .filter((c: unknown): c is Record<string, unknown> => !!c && typeof c === 'object')
      .map((c) => {
        const parentIdRaw = c.parentId;
        const parentId =
          parentIdRaw === null || parentIdRaw === undefined ? null : toSafeId(parentIdRaw);

        return {
          id: toSafeId(c.id),
          name: typeof c.name === 'string' ? c.name : '',
          parentId,
        };
      })
    : [];

  return (
    <>
      {/* スティッキーヘッダー */}
      <header className="sticky top-16 md:top-20 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={12} />
            ホームに戻る
          </Link>
        </div>
      </header>

      {/* ページコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ページタイトル */}
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
            記事を作成
          </h2>
          <p className="text-sm text-stone-500 mt-1">コンテンツを入力して公開しましょう</p>
        </div>

        <PostForm
          mode="create"
          sessionToken={token ?? null}
          canPublish={Boolean(user)}
          availableTags={serializedTags}
          availableCategories={serializedCategories}
        />
      </div>
    </>
  );
}
