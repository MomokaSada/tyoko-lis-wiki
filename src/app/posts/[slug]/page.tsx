import { notFound } from 'next/navigation';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { getAccessibleContentDetail } from '@/server/services/contentService';
import Link from 'next/link';
import {
  Edit3,
  History,
  ChevronRight,
  Clock,
  Eye,
  Hash,
  BookOpen,
  Calendar,
  Layers,
  Tag as TagIcon,
  Info,
  ChevronLeft,
  Activity,
  Box
} from 'lucide-react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import TableOfContents from '@/components/posts/TableOfContents';
import { BlockViewerDynamic } from '@/components/editor/BlockViewerDynamic';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { getFullContentTaxonomy, resolveCategoryPath } from '@/server/services/taxonomyService';
import { ShareButton } from '@/components/posts/ShareButton';
import { createHeadingIdBase, createUniqueHeadingId, normalizeHeadingText } from '@/lib/heading';

/**
 * Zenn風の高度な目次抽出ツール
 * H1 (#) 〜 H4 (####) に対応
 */
function extractToc(markdown: string) {
  if (!markdown) return [];
  // 改行コードの正規化 (\r\n -> \n)
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const toc: { id: string, text: string, level: number }[] = [];
  const usedIds = new Map<string, number>();
  let isInCodeBlock = false;

  lines.forEach(line => {
    // コードブロックの開始/終了を検知
    if (line.trim().startsWith('```')) {
      isInCodeBlock = !isInCodeBlock;
      return;
    }

    // コードブロック内はスキップ
    if (isInCodeBlock) return;

    // 行頭・行末の空白を考慮し、H1-H6まで対応
    const match = line.match(/^\s*(#{1,6})\s*(.+?)\s*$/);
    if (match) {
      const level = match[1].length;
      const text = normalizeHeadingText(match[2]);
      if (text) {
        // 見出しテキストから ID を生成 (BlockViewer.tsx のロジックと完全に一致させる)
        const id = createUniqueHeadingId(createHeadingIdBase(text), usedIds);
        toc.push({ id, text, level });
      }
    }
  });

  return toc;
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
  const post = await getAccessibleContentDetail(slug, editor);

  if (!post) {
    notFound();
  }

  // タクソノミー情報の取得
  const { tags: rawTags, categories: rawPostCategories, allCategories: rawAllCategories } = await getFullContentTaxonomy(post.id);

  // 防御的なマッピング
  const tags = Array.isArray(rawTags) 
    ? rawTags.filter(t => t && typeof t === 'object').map(t => ({ id: (t as any).id, name: (t as any).name || '' }))
    : [];
  
  const allCategories = Array.isArray(rawAllCategories)
    ? rawAllCategories.filter(c => c && typeof c === 'object').map(c => ({ 
        id: (c as any).id, 
        name: (c as any).name || '', 
        parentId: (c as any).parentId ?? null 
      }))
    : [];

  const postCategories = Array.isArray(rawPostCategories)
    ? rawPostCategories.filter(c => c && typeof c === 'object').map(c => ({ id: (c as any).id, name: (c as any).name || '' }))
    : [];

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

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20">
      {/* 1. ヒーローセクション */}
      <div className="relative w-full min-h-[400px] md:min-h-[500px] h-auto overflow-hidden bg-stone-900 border-b border-stone-800">
        {/* 背景のボケ画像またはグラデーション */}
        {hasThumbnail ? (
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-30 transform-gpu"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-black opacity-80" />
        )}

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        {/* コンテンツ */}
        <div className="relative max-w-7xl mx-auto px-6 flex flex-col pt-16 pb-48 md:pb-56 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* 第1行: カテゴリラベル + 公開ステータス */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Layers size={12} className="text-stone-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-500">Category Archive</span>
            </div>
            
            {'isPublished' in post && !post.isPublished && (
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                非公開の下書き
              </span>
            )}
          </div>

          {/* 第2行: パンくずリスト + アクションボタン */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <nav className="flex flex-wrap items-center gap-2 text-[10px] md:text-[11px] text-stone-300 font-bold uppercase tracking-[0.2em] drop-shadow">
              {categoryPath.map((cat, i) => (
                <span key={cat.id} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight size={12} className="text-stone-500 opacity-60" />}
                  <Link
                    href={`/posts?q=${encodeURIComponent(cat.name)}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </span>
              ))}
              {categoryPath.length > 0 && <ChevronRight size={12} className="text-stone-500 opacity-60" />}
              <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <div className="flex gap-3">
              {editor && (
                <Link
                  href={editHref}
                  className="px-6 py-3 bg-white text-stone-900 text-sm font-black rounded-2xl hover:bg-stone-200 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5"
                >
                  <Edit3 size={18} /> 記事を編集
                </Link>
              )}
              <ShareButton title={post.title} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. メインコンテンツ & サイドパネル */}
      <div className="max-w-7xl mx-auto px-6 -mt-[320px] relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* 左側：メインコンテンツエリア */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="bg-white border border-stone-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="p-6 md:p-10 lg:p-14">

                <div className="pb-4 border-b border-stone-100 flex items-center justify-between">
                  <Link
                    href={postsIndexHref}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold transition-colors text-sm"
                  >
                    <ChevronLeft size={16} />
                    記事一覧に戻る
                  </Link>
                  <div className="flex items-center gap-4 text-stone-300">
                    <TyokoreIcon className="w-8 h-8 opacity-20" />
                  </div>
                </div>

                <div className="max-w-4xl">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight drop-shadow-sm m-4">
                    {post.title}
                  </h1>
                </div>
                {/* 記事冒頭のアイキャッチ */}
                <div className="mb-14 rounded-3xl overflow-hidden border border-stone-100 shadow-sm bg-stone-50">
                  <img
                    src={thumbnailUrl || fallbackThumbnail}
                    alt={post.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>

                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-stone-900 prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-stone-200 prose-blockquote:bg-stone-50/50 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-img:rounded-3xl prose-pre:bg-stone-900 prose-pre:rounded-2xl prose-pre:shadow-xl">
                  <div className="text-stone-700 leading-relaxed">
                    <BlockViewerDynamic markdown={post.content} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：インフォボックス & TOC */}
          <div className="w-full lg:w-80 order-1 lg:order-2 space-y-6">

            {/* 記事プロフィール (モックアップ構成 + 日本語詳細コンテンツ) */}
            <div className="bg-white border border-stone-200 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-in slide-in-from-right-4 duration-500 delay-300 overflow-hidden">

              {/* ダークヘッダー */}
              <div className="bg-[#1c1c1c] py-3 text-center border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">記事プロフィール</span>
              </div>

              {/* サムネイル (ヘッダー直下に隙間なく配置) */}
              <div className="aspect-video w-full bg-stone-100 border-b border-stone-100">
                <img
                  src={thumbnailUrl || fallbackThumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* コンテンツエリア (前回の日本語構成) */}
              <div className="p-7 space-y-9">
                {/* 1. 基本情報 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center shadow-sm text-stone-400 border border-stone-100">
                      <Info size={16} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">基本情報</h3>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-stone-900 tracking-tight leading-tight">{post.title}</h2>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest break-all opacity-60">{post.slug}</p>
                  </div>
                </div>

                {/* 2. 履歴 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <History size={14} className="text-stone-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">履歴 / History</h4>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-800">{formattedDate} <span className="text-[10px] text-stone-400 font-normal">第#{post.latestRevision ?? 1}版</span></p>
                      <p className="text-[10px] text-stone-500 leading-snug">最新のスナップショットが正常に保存されています。</p>
                    </div>
                  </div>
                </div>

                {/* 3. 情報詳細 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Activity size={14} className="text-stone-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">情報 / Metadata</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 shadow-sm border border-stone-100">
                        <Eye size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-stone-800">{post.viewCount} 回表示</p>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 shadow-sm border border-stone-100">
                        <Layers size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-stone-800">{post.latestRevision ?? 1} リビジョン</p>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Version</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. カテゴリ */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Box size={14} className="text-stone-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">階層 / Category</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {categoryPath.length > 0 ? (
                      categoryPath.map((cat, i) => (
                        <span key={cat.id} className="flex items-center gap-1.5">
                          {i > 0 && <ChevronRight size={10} className="text-stone-300" />}
                          <Link
                            href={`/posts?q=${encodeURIComponent(cat.name)}`}
                            className={`font-black hover:text-blue-600 transition-colors ${i === categoryPath.length - 1 ? 'text-stone-900' : 'text-stone-300'}`}
                          >
                            {cat.name}
                          </Link>
                        </span>
                      ))
                    ) : (
                      <span className="text-stone-300 font-bold italic">未設定</span>
                    )}
                  </div>
                </div>

                {/* 5. タグ */}
                {tags.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                      <TagIcon size={14} className="text-stone-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">タグ / Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/posts?q=${encodeURIComponent(tag.name)}`}
                          className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-xl text-[10px] font-black transition-all hover:-translate-y-0.5"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 底部フッター */}
              <div className="mt-4 pt-6 pb-6 border-t border-stone-100/50 flex justify-center">
                <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">tyoko-lis-wiki v1.0</p>
              </div>
            </div>

            {/* Zenn風 見出し目次 (TOC) - クライアントコンポーネント化 */}
            <TableOfContents toc={toc} />
          </div>
        </div>
      </div>
    </div>
  );
}
