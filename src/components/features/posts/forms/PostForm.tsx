'use client';

import { useActionState, useState, useEffect, useMemo, useRef } from 'react';
import {
  createContentAction,
  updateContentAction,
  type ContentActionState,
} from '@/server/actions/contentActions';
import {
  ImagePlus, RefreshCw, Heading1, Link2, PenLine,
  Image, Tag, Folder, Clock, Rocket, Globe, Trash2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { TagInput } from '@/components/ui/TagInput';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { Modal } from '@/components/ui/Modal';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { DeletePostForm } from './DeletePostForm';
import { slugify } from '@/lib/slug-utils';
import { getCategoryPath } from '@/lib/clientCategoryUtils';

const BlockEditor = dynamic(() => import('@/components/editor/BlockEditor'), { ssr: false, loading: () => <p>エディタを読み込み中...</p> });

// エラーフォールバック用画像コンポーネント
function ThumbnailImage({ src, alt, className, style }: { src: string, alt: string, className?: string, style?: React.CSSProperties }) {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [src]);

  return (
    <img
      src={error ? '/images/no-image.png' : src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
}

const initialState: ContentActionState = {
  error: null,
  slug: null,
  title: null,
};

type CategoryOption = {
  id: number;
  name: string;
  parentId: number | null;
};

type PostFormProps = {
  mode: 'create' | 'modify';
  sessionToken: string | null;
  canPublish: boolean;
  availableTags: Array<{ id: number; name: string }>;
  availableCategories: CategoryOption[];
  content?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail: string | null;
    isPublished: boolean;
    tagIds: number[];
    categoryIds: number[];
  };
};

export function PostForm({
  mode,
  sessionToken,
  canPublish,
  availableTags,
  availableCategories,
  content,
}: PostFormProps) {
  const isEdit = mode === 'modify' && content;
  const formAction = isEdit ? updateContentAction : createContentAction;
  const [state, action, isPending] = useActionState(formAction, initialState);

  // States
  const [thumbnailUrl, setThumbnailUrl] = useState(content?.thumbnail ?? '');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [title, setTitle] = useState(content?.title ?? '');
  const [slug, setSlug] = useState(content?.slug ?? '');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEdit ? true : false);

  // Auto-sync slug from title if not manually edited (only in create mode or if explicitly requested)
  useEffect(() => {
    if (!isSlugManuallyEdited && !isEdit) {
      setSlug(slugify(title));
    }
  }, [title, isSlugManuallyEdited, isEdit]);

  // Cropping State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // カテゴリ階層の深さを計算
  const categoriesWithDepth = useMemo(() => {
    function computeDepth(catId: number, allCats: CategoryOption[], seen = new Set<number>()): number {
      if (seen.has(catId)) return 0; // 循環参照防止
      seen.add(catId);
      const cat = allCats.find((c) => c.id === catId);
      if (!cat || cat.parentId === null) return 0;
      return computeDepth(cat.parentId, allCats, seen) + 1;
    }

    return availableCategories.map((cat) => ({
      ...cat,
      depth: computeDepth(cat.id, availableCategories),
    }));
  }, [availableCategories]);

  // 親カテゴリ選択
  const [selectedCategoryParentId, setSelectedCategoryParentId] = useState<number | null>(null);
  // Newカテゴリが追加されたか（親選択ツリーの表示制御用）
  const [hasNewCategory, setHasNewCategory] = useState(false);

  // 未保存変更のトラッキング（ナビゲーション警告用）
  const isDirtyRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = true;
  }, [title, slug, thumbnailUrl, removeThumbnail, selectedCategoryParentId]);

  // 保存成功時にdirtyフラグをリセット
  useEffect(() => {
    if (state.slug) {
      isDirtyRef.current = false;
    }
  }, [state.slug]);

  // beforeunload で未保存警告
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  async function handleCropComplete(croppedBlob: Blob) {
    setIsCropperOpen(false);
    setIsUploadingThumbnail(true);
    setThumbnailError(null);

    const previewUrl = URL.createObjectURL(croppedBlob);
    setLocalPreviewUrl(previewUrl);

    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'thumbnail.jpg');

      if (sessionToken) {
        formData.set('session', sessionToken);
      }

      const response = await fetch('/api/uploads/thumbnail', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'サムネイル画像のアップロードに失敗しました');
      }

      setThumbnailUrl(data.url);
      setRemoveThumbnail(false);
    } catch (error) {
      setThumbnailError(
        error instanceof Error
          ? error.message
          : 'サムネイル画像のアップロードに失敗しました',
      );
    } finally {
      setIsUploadingThumbnail(false);
    }
  }

  return (
    <>
      {/* 画像トリミングモーダル（フォームの外＝画面全体に固定） */}
      <Modal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        title="画像をトリミング"
        maxWidth="max-w-2xl"
      >
        {imageToCrop && (
          <ImageCropper
            image={imageToCrop}
            onCropComplete={handleCropComplete}
            onCancel={() => setIsCropperOpen(false)}
          />
        )}
      </Modal>

      <form action={action} className="space-y-8">
        <input type="hidden" name="session" value={sessionToken ?? ''} />
        {isEdit && <input type="hidden" name="contentId" value={content.id} />}
        <input type="hidden" name="thumbnail" value={removeThumbnail ? '' : thumbnailUrl} />

        {/* ============================================
            2カラムレイアウト（デスクトップ）
            ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ──── LEFT COLUMN ──── */}
          <div className="space-y-8 min-w-0">

            {/* ── タイトル + スラッグ カード ── */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 space-y-6 transition-all duration-200">
            {/* タイトル */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                <Heading1 size={14} className="text-stone-400" />
                <span>タイトル</span>
              </div>
              <input
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl lg:text-3xl font-black text-stone-900 placeholder:text-stone-300 border-none bg-transparent focus:ring-0 px-0 focus:outline-none transition-colors"
                placeholder="項目のタイトルを入力..."
              />
              {state.fieldErrors?.title && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{state.fieldErrors.title}</p>
              )}
            </div>

            {/* スラッグ */}
            <div className="pt-5 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <Link2 size={12} className="text-stone-400" />
                  <span>スラッグ (URL)</span>
                </div>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlug(slugify(title));
                      setIsSlugManuallyEdited(false);
                    }}
                    className="text-[10px] font-bold text-stone-400 hover:text-amber-600 transition-colors flex items-center gap-1 group"
                  >
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    タイトルから生成
                  </button>
                )}
              </div>
              {isEdit ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-400 font-medium shrink-0">/posts/</span>
                    <div className="flex-1 font-mono text-sm text-stone-400 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 font-medium cursor-not-allowed truncate">
                      {slug}
                    </div>
                  </div>
                  <input type="hidden" name="slug" value={slug} />
                  <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    <span className="text-amber-500">⚠</span> 公開後のスラッグ変更はできません。新規作成時にのみ設定可能です。
                  </p>
                  {state.fieldErrors?.slug && (
                    <p className="text-[10px] font-bold text-red-500 ml-1">{state.fieldErrors.slug}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-400 font-medium shrink-0">/posts/</span>
                    <input
                      name="slug"
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsSlugManuallyEdited(true);
                      }}
                      className="flex-1 font-mono text-sm text-blue-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                      placeholder="url-slug-here"
                    />
                  </div>
                  {!isSlugManuallyEdited && title && (
                    <p className="text-[10px] text-stone-400 font-bold ml-1">✨ タイトルに合わせて自動更新中</p>
                  )}
                  {state.fieldErrors?.slug && (
                    <p className="text-[10px] font-bold text-red-500 ml-1">{state.fieldErrors.slug}</p>
                  )}
                  <p className="text-[10px] text-stone-400 flex items-center gap-1">
                    <span className="text-stone-300">ℹ</span> スラッグはURLに使用されます。公開後は変更できません。
                  </p>
                </>
              )}
            </div>
          </section>

          {/* ── 本文エディタ カード ── */}
          <section className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <PenLine size={14} className="text-stone-400" />
                <span>本文</span>
              </div>
              <Link
                href="/guide/markdown"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-stone-400 hover:text-amber-600 transition-colors underline decoration-dotted underline-offset-2"
              >
                Markdown記法ガイド ↗
              </Link>
            </div>
            <div className="-mx-2">
              <BlockEditor initialMarkdown={content?.content ?? ''} name="content" />
            </div>
            {state.fieldErrors?.content && (
              <p className="text-[10px] font-bold text-red-500 mt-3">{state.fieldErrors.content}</p>
            )}
          </section>

          {/* ── デスクトップ用: 最終保存表示（モバイルでは非表示） ── */}
          <div className="hidden lg:flex items-center justify-between">
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <Clock size={12} className="text-stone-300" />
              最終保存: 未保存
            </p>
          </div>
        </div>

        {/* ──── RIGHT COLUMN: サイドバー ──── */}
        <div className="space-y-6 lg:sticky lg:top-28">

          {/* ── 公開設定 カード ── */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Globe size={14} />
                  公開する
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">オフにすると下書きになります</p>
              </div>
              {canPublish ? (
                <label className="form-switch">
                  <input name="isPublished" type="checkbox" defaultChecked={isEdit ? content.isPublished : true} />
                  <span className="slider"></span>
                </label>
              ) : isEdit ? (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-md whitespace-nowrap ${content?.isPublished
                  ? 'bg-white/10 text-stone-300 border border-stone-600'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${content?.isPublished ? 'bg-amber-500' : 'bg-stone-400'}`} />
                  {content?.isPublished ? '公開中' : '下書き'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-md bg-white/10 text-stone-300 border border-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  公開
                </span>
              )}
            </div>
          </div>

          {/* ── サムネイル画像 カード ── */}
          <section className="bg-white border border-stone-200 rounded-2xl p-5 transition-all duration-200 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-3">
              <Image size={14} className="text-stone-400" />
              <span>サムネイル画像</span>
            </div>

            <div className="thumbnail-group relative aspect-video rounded-xl border-2 border-dashed border-stone-300 overflow-hidden cursor-pointer bg-stone-50 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50/30"
              onClick={() => document.getElementById('thumb-input')?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('thumb-input')?.click(); }}
            >
              {(!removeThumbnail && (localPreviewUrl || getPublicThumbnailUrl(thumbnailUrl))) ? (
                <>
                  <ThumbnailImage
                    src={localPreviewUrl || getPublicThumbnailUrl(thumbnailUrl) || '/images/no-image.png'}
                    alt="Thumbnail preview"
                    className={`w-full h-full object-cover transition-all duration-300 ${isUploadingThumbnail ? 'blur-sm scale-105' : ''}`}
                  />
                  <div className="thumbnail-overlay">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg text-xs font-bold text-stone-700 shadow-sm">
                      <ImagePlus size={14} />
                      変更
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                  <Image size={32} className="text-stone-300 mb-2" />
                  <p className="text-xs font-bold text-stone-400 text-center">クリックして画像を選択</p>
                  <p className="text-[10px] text-stone-300 mt-1 text-center">5MB以下のPNG/JPEG/WEBP</p>
                </div>
              )}
              {isUploadingThumbnail && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-xl">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">アップロード中...</span>
                  </div>
                </div>
              )}
            </div>

            <input
              id="thumb-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            {thumbnailUrl && !removeThumbnail && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setRemoveThumbnail(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors active:scale-[0.98]"
                >
                  <Trash2 size={13} />
                  サムネイルを削除
                </button>
              </div>
            )}
            {removeThumbnail && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <span>削除予定</span>
                <button
                  type="button"
                  onClick={() => setRemoveThumbnail(false)}
                  className="ml-auto text-stone-500 hover:text-stone-800 underline transition-colors"
                >
                  元に戻す
                </button>
              </div>
            )}

            {thumbnailError && <p className="text-xs font-bold text-red-600 mt-2">{thumbnailError}</p>}
          </section>

          {/* ── タグ カード ── */}
          <section className="bg-white border border-stone-200 rounded-2xl p-5 transition-all duration-200 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-3">
              <Tag size={14} className="text-stone-400" />
              <span>タグ</span>
            </div>
            <TagInput
              availableItems={availableTags}
              initialSelectedItems={isEdit ? content.tagIds.map(id => {
                const tag = availableTags.find(t => t.id === id);
                return tag ? { id: tag.id, name: tag.name } : null;
              }).filter((item): item is { id: number, name: string } => !!item) : []}
              nameForExisting="tagIds"
              nameForNew="newTags"
              placeholder="タグを検索または追加..."
              allowMultipleNew={true}
            />
          </section>

          {/* ── カテゴリ カード ── */}
          <section className="bg-white border border-stone-200 rounded-2xl p-5 transition-all duration-200 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-3">
              <Folder size={14} className="text-stone-400" />
              <span>カテゴリ</span>
            </div>
            <TagInput
              availableItems={categoriesWithDepth}
              initialSelectedItems={isEdit ? content.categoryIds.map(id => {
                const cat = categoriesWithDepth.find(c => c.id === id);
                return cat ? { id: cat.id, name: cat.name } : null;
              }).filter((item): item is { id: number, name: string } => !!item) : []}
              nameForExisting="categoryIds"
              nameForNew="newCategoryName"
              placeholder="カテゴリを検索または入力..."
              allowMultipleNew={false}
              onNewItemChange={setHasNewCategory}
            />

            {/* 新規カテゴリ作成時のみ親選択ツリーを表示 */}
            <input type="hidden" name="newCategoryParentId" value={selectedCategoryParentId ?? ''} />
            {hasNewCategory && (
              <div className="mt-3 bg-amber-50/30 border border-amber-100 rounded-xl p-3 animate-fade-up">
                <p className="text-[10px] font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                  <span className="text-xs">✚</span>
                  新規カテゴリの親を選択（省略可）:
                </p>
                <div className="max-h-40 overflow-y-auto bg-white border border-stone-200 rounded-lg p-1 space-y-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryParentId(null)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-colors ${selectedCategoryParentId === null
                      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                      : 'text-stone-500 hover:bg-stone-50'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedCategoryParentId === null ? 'border-amber-500' : 'border-stone-300'
                        }`}>
                        {selectedCategoryParentId === null && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </span>
                      親なし（トップレベル）
                    </span>
                  </button>
                  {categoriesWithDepth.map((cat) => {
                    const depth = cat.depth ?? 0;
                    const parentPath = getCategoryPath(cat.id, availableCategories).slice(0, -1).join(' > ');
                    const isSelected = selectedCategoryParentId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryParentId(cat.id)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 ${isSelected
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                          : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        style={{ paddingLeft: `${10 + depth * 24}px` }}
                      >
                        <span className="flex items-center shrink-0 text-stone-300 select-none" style={{ width: depth * 12 + 10 }}>
                          {depth > 0 && (
                            <>
                              {Array.from({ length: depth - 1 }).map((_, i) => (
                                <span key={i} className="w-3 text-center text-stone-200">│</span>
                              ))}
                              <span className="text-stone-400 text-[9px]">└</span>
                            </>
                          )}
                        </span>
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-amber-500' : 'border-stone-300'
                          }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        </span>
                        <span className="font-medium text-stone-800">{cat.name}</span>
                        {depth > 0 && parentPath && (
                          <span className="text-[9px] text-stone-400 font-normal truncate ml-auto max-w-[100px]">
                            {parentPath}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ── アクションボタン カード ── */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <button
              type="submit"
              disabled={isPending || isUploadingThumbnail}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 text-sm"
            >
              {isPending || isUploadingThumbnail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {isUploadingThumbnail ? '画像アップロード中...' : '保存中...'}
                </>
              ) : (
                <>
                  <Rocket size={16} />
                  {isEdit ? '項目を更新する' : '公開する'}
                </>
              )}
            </button>
            <p className="text-[10px] text-stone-400 text-center mt-3">
              公開すると誰もが閲覧できるようになります
            </p>
          </div>

        </div>
      </div>

      {/* ── 削除（管理者/オーナー、編集モードのみ） ── */}
      {isEdit && canPublish && content && (
        <div className="flex justify-center pt-4 border-t border-stone-200 animate-fade-up">
          <DeletePostForm contentId={content.id} />
        </div>
      )}

      {/* ============================================
          エラー/成功 バナー
          ============================================ */}
      {(state.error || state.fieldErrors?._general) && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl font-bold text-sm animate-fade-up">
          {state.fieldErrors?._general ?? state.error}
        </div>
      )}

      {state.slug && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl font-bold text-sm animate-fade-up">
          ✓ {isEdit ? '更新完了' : '作成完了'}: {state.title}
        </div>
      )}
    </form>
    </>
  );
}
