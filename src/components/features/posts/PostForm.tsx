'use client';

import { useActionState, useState, useEffect, useMemo, useRef } from 'react';
import {
  createContentAction,
  updateContentAction,
  type ContentActionState,
} from '@/server/actions/contentActions';
import { ImagePlus, Save, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TagInput } from '@/components/ui/TagInput';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { Modal } from '@/components/ui/Modal';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { DeletePostForm } from '@/components/features/posts/DeletePostForm';
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
    <form action={action} className="space-y-6">
      <input type="hidden" name="session" value={sessionToken ?? ''} />
      {isEdit && <input type="hidden" name="contentId" value={content.id} />}
      <input type="hidden" name="thumbnail" value={removeThumbnail ? '' : thumbnailUrl} />

      {/* === メインエリア: タイトル + スラッグ === */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
        <label className="block space-y-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">タイトル</span>
          <input
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-black text-stone-900 placeholder:text-stone-300 border-none bg-transparent focus:ring-0 px-0 focus:outline-none"
            placeholder="項目のタイトルを入力..."
          />
          {state.fieldErrors?.title && (
            <p className="text-[10px] font-bold text-red-500 ml-1">{state.fieldErrors.title}</p>
          )}
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">スラッグ (URL)</span>
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
              <div className="w-full font-mono text-sm text-stone-400 bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 font-medium cursor-not-allowed">
                {slug}
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
              <input
                name="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManuallyEdited(true);
                }}
                className="w-full font-mono text-sm text-blue-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                placeholder="スラッグを入力"
              />
              {!isSlugManuallyEdited && title && (
                <p className="text-[10px] text-stone-400 font-bold ml-1 animate-pulse">✨ タイトルに合わせて自動更新中</p>
              )}
              {state.fieldErrors?.slug && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{state.fieldErrors.slug}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* === メタデータエリア: サムネイル / タグ / カテゴリ / 公開設定 === */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-5">
        <div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">サムネイル画像</span>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full max-w-md aspect-video rounded-xl border border-stone-200 overflow-hidden shadow-sm bg-stone-50 group">
              <ThumbnailImage
                src={(!removeThumbnail && (localPreviewUrl || getPublicThumbnailUrl(thumbnailUrl))) ? (localPreviewUrl || getPublicThumbnailUrl(thumbnailUrl) || '/images/no-image.png') : '/images/no-image.png'}
                alt="Thumbnail preview"
                className={`w-full h-full object-cover transition-all duration-300 ${isUploadingThumbnail ? 'blur-sm scale-105' : ''}`}
              />
              {isUploadingThumbnail && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">アップロード中...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors text-xs font-bold shadow-sm">
                <ImagePlus className="w-3.5 h-3.5" />
                {thumbnailUrl && !removeThumbnail ? '画像を変更' : '画像をアップロード'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {thumbnailUrl && !removeThumbnail && (
                <div className="flex items-center gap-2">
                  <input
                    id="removeThumbnail"
                    name="removeThumbnail"
                    type="checkbox"
                    checked={removeThumbnail}
                    onChange={(event) => setRemoveThumbnail(event.currentTarget.checked)}
                    className="w-4 h-4 border-stone-300 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="removeThumbnail" className="text-sm font-medium text-stone-600">
                    サムネイルを削除する
                  </label>
                </div>
              )}

              {thumbnailError && <p className="text-xs font-bold text-red-600">{thumbnailError}</p>}
              <p className="text-xs text-stone-400 font-medium">5MB以下のPNG/JPEG/WEBP等推奨。16:9でトリミングされます。</p>
            </div>
          </div>
        </div>

        {/* Cropper Modal */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-200">
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">タグ</legend>
            <TagInput
              availableItems={availableTags}
              initialSelectedItems={isEdit ? content.tagIds.map(id => {
                const tag = availableTags.find(t => t.id === id);
                return tag ? { id: tag.id, name: tag.name } : null;
              }).filter((item): item is { id: number, name: string } => !!item) : []}
              nameForExisting="tagIds"
              nameForNew="newTags"
              placeholder="タグを検索または新規入力して追加..."
              allowMultipleNew={true}
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">カテゴリ</legend>
            <TagInput
              availableItems={categoriesWithDepth}
              initialSelectedItems={isEdit ? content.categoryIds.map(id => {
                const cat = categoriesWithDepth.find(c => c.id === id);
                return cat ? { id: cat.id, name: cat.name } : null;
              }).filter((item): item is { id: number, name: string } => !!item) : []}
              nameForExisting="categoryIds"
              nameForNew="newCategoryName"
              placeholder="カテゴリを検索または新規入力..."
              allowMultipleNew={false}
              onNewItemChange={setHasNewCategory}
            />

            {/* 新規カテゴリ作成時のみ親選択ツリーを表示 */}
            <input type="hidden" name="newCategoryParentId" value={selectedCategoryParentId ?? ''} />
            {hasNewCategory && (
              <div className="mt-3 bg-amber-50/30 border border-amber-100 rounded-xl p-3">
                <p className="text-[10px] font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                  <span className="text-xs">✚</span>
                  新規カテゴリの親を選択（省略可）:
                </p>
                <div className="max-h-40 overflow-y-auto bg-white border border-stone-200 rounded-lg p-1 space-y-0.5 custom-scrollbar shadow-sm">
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
          </fieldset>
        </div>

        <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canPublish ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input name="isPublished" type="checkbox" defaultChecked={isEdit ? content.isPublished : true} className="sr-only peer" />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                <span className="ml-3 text-sm font-extrabold text-stone-800 peer-checked:text-amber-700">項目を公開状態にする</span>
              </label>
            ) : isEdit ? (
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md ${content?.isPublished
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-100 text-stone-500 border border-stone-200'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${content?.isPublished ? 'bg-emerald-500' : 'bg-stone-400'
                  }`} />
                {content?.isPublished ? '公開中' : '下書き'}
                <span className="text-[10px] opacity-70">（変更不可）</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                公開
                <span className="text-[10px] opacity-70">（変更不可）</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* === メインコンテンツ: 本文 === */}
      <div className="mt-8">
        <div className="">
          <BlockEditor initialMarkdown={content?.content ?? ''} name="content" />
        </div>
        {state.fieldErrors?.content && (
          <p className="text-[10px] font-bold text-red-500 mt-2">{state.fieldErrors.content}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        {isEdit && canPublish && content && (
          <DeletePostForm contentId={content.id} />
        )}
        <div className="flex-1 flex justify-end">
          <button
            type="submit"
            disabled={isPending || isUploadingThumbnail}
            className="bg-stone-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {isUploadingThumbnail ? '画像アップロード中...' : isPending ? '保存中...' : (isEdit ? '項目を更新する' : '項目を作成する')}
          </button>
        </div>
      </div>

      {(state.error || state.fieldErrors?._general) && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl font-bold text-sm">
          {state.fieldErrors?._general ?? state.error}
        </div>
      )}

      {state.slug && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl font-bold text-sm">
          ✓ {isEdit ? '更新完了' : '作成完了'}: {state.title} (Slug: {state.slug})
        </div>
      )}
    </form>
  );
}
