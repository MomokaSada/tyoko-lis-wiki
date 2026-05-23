import { requireEditSession } from '@/lib/auth/guards';
import { getTaxonomyOptions } from '@/server/services/contentService';
import Link from 'next/link';
import { PostForm } from '@/components/features/posts/PostForm';

function toSafeId(value: unknown): number {
  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const sessionToken = typeof sp.session === 'string' ? sp.session : null;

  // Guard 実行: NG ならリダイレクトされる
  const { token, valid, user } = await requireEditSession(sessionToken);

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
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-stone-200 pb-8">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-stone-400 hover:text-stone-800 transition-colors mb-4 uppercase tracking-widest">
          ← ホームに戻る
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter leading-none">新規項目作成</h1>
        </div>
      </div>

      <div className="relative mt-8">
        <PostForm
          mode="create"
          sessionToken={token ?? null}
          canPublish={Boolean(user)}
          availableTags={serializedTags}
          availableCategories={serializedCategories}
        />
      </div>
    </div>
  );
}
