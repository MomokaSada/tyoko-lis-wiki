import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import Image from 'next/image';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { cache } from 'react';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { getAccessibleContentDetail } from '@/server/services/contentService';
import {
    getFullContentTaxonomy,
    resolveCategoryPath,
} from '@/server/services/taxonomyService';

import Link from 'next/link';
import {
  Edit3,
  History,
  ChevronRight,
  Eye,
  Layers,
  Tag as TagIcon,
  Info,
  ChevronLeft,
  Activity,
  Box
} from 'lucide-react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import TableOfContents from './_sections/TableOfContents';
import { BlockViewerDynamic } from '@/components/editor/BlockViewerDynamic';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';

import { PostShareActions } from './_sections/PostShareActions';
import { ArticleProfile } from './_sections/ArticleProfile';
import { MobileActions } from '@/components/layout/MobileActions';
import { z } from 'zod';
import { tagSchema, categorySchema, postCategorySchema } from '@/server/schemas/postSchemas';
import { extractToc } from '@/server/lib/extractToc';

// ---------------------------------------------------------------------------
// JSON-LD 構造化データ（Schema.org）
// ---------------------------------------------------------------------------

/**
 * 記事ページ用の JSON-LD を生成する。
 * Article と BreadcrumbList の2種類を配列で返す。
 */
function generateArticleJsonLd(
  post: NonNullable<Awaited<ReturnType<typeof getCachedContentDetail>>>,
  categoryPath: { id: number; name: string }[],
  thumbnailUrl: string | null,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tyokore.com';
  const canonicalUrl = `${appUrl}/posts/${encodeURIComponent(post.slug)}`;
  const description = post.content
    ? post.content.substring(0, 160).replace(/[#*\[\]]/g, '').trim()
    : post.title;
  const datePublished = post.createdAt instanceof Date ? post.createdAt.toISOString() : undefined;
  const dateModified = post.updatedAt instanceof Date ? post.updatedAt.toISOString() : undefined;

  const breadcrumbItems = categoryPath.map((cat, i) => ({
    '@type': 'ListItem' as const,
    position: i + 1,
    name: cat.name,
    item: `${appUrl}/posts?categoryId=${cat.id}`,
  }));

  const breadcrumb = breadcrumbItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      }
    : undefined;

  const article: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: {
      '@type': 'Organization',
      name: 'Tyokore Wiki',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tyokore Wiki',
    },
    ...(thumbnailUrl
      ? {
          image: {
            '@type': 'ImageObject',
            url: thumbnailUrl,
            width: 1200,
            height: 630,
          },
        }
      : {}),
  };

  return [article, ...(breadcrumb ? [breadcrumb] : [])];
}

// React.cache でリクエスト単位での二重フェッチを防止
const getCachedContentDetail = cache(getAccessibleContentDetail);

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = (() => {
    try {
      return decodeURIComponent(rawSlug);
    } catch {
      return rawSlug;
    }
  })();

  try {
    const post = await getCachedContentDetail(slug, null);

    if (!post) {
      return {
        title: '項目が見つかりません',
      };
    }

    const description = post.content
      ? post.content
          // コードブロックとインラインコードを除去
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`[^`]+`/g, '')
          // Markdown リンク [text](url) → text
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          // 画像 ![alt](url) を除去
          .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
          // 装飾記号（#, *, _, ~~, >, - など）を除去
          .replace(/[#*_~>`\-|]/g, '')
          .substring(0, 160)
          .trim()
      : post.title;

    const thumbnailUrl = getPublicThumbnailUrl(post.thumbnail);
    const ogImage = thumbnailUrl || '/images/no-image.png';

    const datePublished = post.createdAt instanceof Date ? post.createdAt.toISOString() : undefined;
    const dateModified = post.updatedAt instanceof Date ? post.updatedAt.toISOString() : undefined;

    return {
      title: post.title,
      description: description || '項目詳細ページ',
      alternates: {
        canonical: `/posts/${encodeURIComponent(post.slug)}`,
      },
      openGraph: {
        title: post.title,
        description: description || '項目詳細ページ',
        type: 'article',
        ...(datePublished ? { publishedTime: datePublished } : {}),
        ...(dateModified ? { modifiedTime: dateModified } : {}),
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: description || '項目詳細ページ',
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: '項目詳細',
      description: 'Tyokore Wiki の項目詳細ページです。',
    };
  }
}

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug: rawSlug } = await params;
  const slug = (() => {
    try {
      return decodeURIComponent(rawSlug);
    } catch {
      return rawSlug;
    }
  })();
  const sp = await searchParams;
  const session = typeof sp.session === 'string' ? sp.session : null;
  const showPrivate = sp.showPrivate === '1';
  const backParams = new URLSearchParams();
  if (session) backParams.set('session', session);
  if (showPrivate) backParams.set('showPrivate', '1');
  const postsIndexHref = `/posts${backParams.toString() ? `?${backParams.toString()}` : ''}`;
  const editor = await getCurrentEditor(session);
  const post = await getCachedContentDetail(slug, editor);

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const hasEditSession = !!(editor && editor.type === 'session');

  if (!post) {
    notFound();
  }

  // タクソノミー情報の取得
  const { tags: rawTags, categories: rawPostCategories, allCategories: rawAllCategories } = await getFullContentTaxonomy(post.id);

  // Zod スキーマで一括パース（従来の手書き型ガードを置き換え）
  const tags = z.array(tagSchema).parse(rawTags ?? []);
  const allCategories = z.array(categorySchema).parse(rawAllCategories ?? []);
  const postCategories = z.array(postCategorySchema).parse(rawPostCategories ?? []);

  // 最初のカテゴリ（あれば）をベースに階層パスを解決
  const categoryPath = postCategories.length > 0
    ? resolveCategoryPath(postCategories[0].id, allCategories)
    : [];

  const editHref = editor && editor.type === 'session'
    ? `/posts/modify?slug=${encodeURIComponent(post.slug)}&session=${encodeURIComponent(editor.sessionId)}`
    : `/posts/modify?slug=${encodeURIComponent(post.slug)}`;

  const toc = extractToc(post.content || '');
  const thumbnailUrl = getPublicThumbnailUrl(post.thumbnail);
  const hasThumbnail = !!thumbnailUrl;
  const fallbackThumbnail = '/images/no-image.png';

  // 日付の安全な文字列化 (SSR時のクラッシュ防止)
  const formattedDate = post.updatedAt instanceof Date
    ? post.updatedAt.toLocaleDateString('ja-JP')
    : '不明';

  const jsonLd = generateArticleJsonLd(post, categoryPath, thumbnailUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="min-h-screen bg-stone-50/50 pb-20">
      {/* 1. ヒーローセクション */}
      <div className="relative w-full min-h-[320px] md:min-h-[420px] h-auto overflow-hidden bg-stone-900 border-b border-stone-800">
        {/* 背景のボケ画像またはグラデーション */}
        {hasThumbnail ? (
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-30 transform-gpu"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-stone-800 via-stone-900 to-black opacity-80" />
        )}

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/40 to-transparent" />

        {/* コンテンツ */}
        <div className="relative max-w-[72rem] mx-auto px-4 sm:px-6 flex flex-col pt-12 md:pt-14 pb-36 md:pb-52 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* 第1行: カテゴリラベル + 公開ステータス */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Layers size={12} className="text-stone-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Category Archive</span>
            </div>

            {'isPublished' in post && !post.isPublished && (
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                非公開の下書き
              </span>
            )}
          </div>

          {/* 第2行: パンくずリスト + アクションボタン */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
            <nav className="flex flex-wrap items-center gap-2 text-[11px] md:text-[12px] text-stone-400 font-bold uppercase tracking-[0.2em] drop-shadow">
              {categoryPath.map((cat, i) => (
                <span key={cat.id} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight size={12} className="text-stone-500 opacity-60" />}
                  <Link
                    href={`/posts?categoryId=${cat.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </span>
              ))}
              {categoryPath.length > 0 && <ChevronRight size={12} className="hidden md:block text-stone-500 opacity-60" />}
              <span className="hidden md:block text-white/60 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <div className="flex flex-wrap gap-3">
              {editor && (
                <Link
                  href={editHref}
                  className="px-5 py-2.5 bg-white text-stone-900 text-sm font-black rounded-2xl hover:bg-stone-200 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5"
                >
                  <Edit3 size={18} /> 項目を編集
                </Link>
              )}
              <Link
                href={`/posts/${encodeURIComponent(post.slug)}/history`}
                className="px-5 py-2.5 bg-stone-800/60 text-stone-300 text-sm font-black rounded-2xl hover:bg-stone-700/60 transition-all active:scale-95 flex items-center gap-2"
              >
                <History size={18} /> 編集履歴
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. メインコンテンツ & サイドパネル */}
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 -mt-40 md:-mt-[280px] relative z-5">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* 左側：メインコンテンツエリア
              - flex-1 + min-w-0 を併用することで、Markdown内のテーブルや
                pre ブロックなど大きい子要素に押し出されて
                メインカラムの幅が想定外に広がるのを防ぐ
              - min-w-0 を入れると、この flex アイテムは min-content: 0 になり、
                親の flex コンテナ幅に厳密に張り付く */}
          <div className="flex-1 min-w-0 order-1 lg:order-1 pb-32 sm:pb-0 pt-0">
            <div className="bg-white border border-stone-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">

                <div className="pb-4 border-b border-stone-100 flex items-center justify-between">
                  <Link
                    href={postsIndexHref}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold transition-colors text-sm"
                  >
                    <ChevronLeft size={16} />
                    項目一覧に戻る
                  </Link>
                  <div className="flex items-center gap-4 text-stone-300">
                    <TyokoreIcon className="w-8 h-8 opacity-20" />
                  </div>
                </div>

                <div className="max-w-4xl pt-8 md:pt-12">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tighter leading-[1.1] drop-shadow-sm mb-6 md:mb-8">
                    {post.title}
                  </h1>
                </div>
                {/* 項目冒頭のアイキャッチ */}
                <div className="mb-10 md:mb-12 rounded-3xl overflow-hidden border border-stone-100 shadow-sm bg-stone-50 relative aspect-video">
                  <Image
                    src={thumbnailUrl || fallbackThumbnail}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="prose prose-stone prose-sm md:prose-base lg:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-stone-900 prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-stone-200 prose-blockquote:bg-stone-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-img:rounded-3xl prose-pre:bg-stone-900 prose-pre:rounded-2xl prose-pre:shadow-xl">
                  <div className="text-stone-700 leading-relaxed">
                    <BlockViewerDynamic markdown={post.content} />
                  </div>
                </div>

                {/* 項目末尾の共有エリア */}
                <PostShareActions title={post.title} />
              </div>
            </div>
          </div>

          {/* 右側：インフォボックス & TOC (モバイルでは非表示) */}
          <div className="w-full lg:w-72 order-2 lg:order-2 space-y-6 hidden lg:block">
            <ArticleProfile
              postTitle={post.title}
              postSlug={post.slug}
              viewCount={post.viewCount}
              latestRevision={post.latestRevision ?? 1}
              formattedDate={formattedDate}
              thumbnailUrl={thumbnailUrl}
              fallbackThumbnail={fallbackThumbnail}
              categoryPath={categoryPath}
              tags={tags}
            />

            {/* Zenn風 見出し目次 (TOC) - クライアントコンポーネント化 */}
            <TableOfContents toc={toc} />
          </div>
        </div>
      </div>

      {/* モバイル限定アクションボタン (FAB) */}
      <MobileActions
        postTitle={post.title}
        postSlug={post.slug}
        userRole={userRole}
        hasEditSession={hasEditSession}
        tocSlot={toc.length > 0 ? <TableOfContents toc={toc} isMobile /> : undefined}
        profileSlot={
          <ArticleProfile
            postTitle={post.title}
            postSlug={post.slug}
            viewCount={post.viewCount}
            latestRevision={post.latestRevision ?? 1}
            formattedDate={formattedDate}
            thumbnailUrl={thumbnailUrl}
            fallbackThumbnail={fallbackThumbnail}
            categoryPath={categoryPath}
            tags={tags}
            isMobile
          />
        }
      />
    </div>
    </>
  );
}
