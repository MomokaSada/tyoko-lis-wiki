import { requireEditSession } from '@/lib/auth/guards';
import { getEditableContentDetail, getTaxonomyOptions } from '@/server/services/contentService';
import { PostForm } from '@/components/features/posts/PostForm';
import Link from 'next/link';

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
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-stone-200 pb-8">
        <Link href={`/posts/${content?.slug ?? ''}`} className="inline-flex items-center text-xs font-bold text-stone-400 hover:text-stone-800 transition-colors mb-4 uppercase tracking-widest">
          ← {content?.title ?? '項目一覧'}に戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter leading-none">項目編集</h1>
        </div>
      </div>

      {content ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm relative mt-8">
          <PostForm
            mode="modify"
            sessionToken={token ?? null}
            canPublish={Boolean(user)}
            availableTags={serializedTags}
            availableCategories={serializedCategories}
            content={content}
          />
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-stone-200 bg-stone-50 rounded-3xl mt-8">
          <p className="text-stone-500 font-medium">上の検索バーで編集対象の slug を指定するとフォームが表示されます。</p>
        </div>
      )}
    </div>
  );
}
