'use client';

import { useActionState, useState, useEffect } from 'react';
import {
  updateContentAction,
  type ContentActionState,
} from '@/server/actions/contentActions';
import { ImagePlus, Save, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TagInput } from '@/components/ui/TagInput';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { Modal } from '@/components/ui/Modal';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { slugify } from '@/lib/slug-utils';

const BlockEditor = dynamic(() => import('@/components/editor/BlockEditor'), { ssr: false, loading: () => <p>エディタを読み込み中...</p> });

// エラーフォールバック用画像コンポーネント (SSRでのインラインonErrorエラーを回避)
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

export function EditPostForm({
  sessionToken,
  canPublish,
  availableTags,
  availableCategories,
  content,
}: {
  sessionToken: string | null;
  canPublish: boolean;
  availableTags: Array<{ id: number; name: string }>;
  availableCategories: Array<{ id: number; name: string; label?: string }>;
  content: {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail: string | null;
    isPublished: boolean;
    tagIds: number[];
    categoryIds: number[];
  };
}) {
  const [state, action, isPending] = useActionState(updateContentAction, initialState);
  const [thumbnailUrl, setThumbnailUrl] = useState(content.thumbnail ?? '');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [title, setTitle] = useState(content.title);
  const [slug, setSlug] = useState(content.slug);

  // Cropping State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
  }

  async function handleCropComplete(croppedBlob: Blob) {
    setIsCropperOpen(false);
    setIsUploadingThumbnail(true);
    setThumbnailError(null);

    // Create a preview URL for the cropped image
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
      <input type="hidden" name="contentId" value={content.id} />
      <input type="hidden" name="thumbnail" value={removeThumbnail ? '' : thumbnailUrl} />

      {/* Editor Main Content Area */}
      <div className="space-y-6">
        <label className="block space-y-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">タイトル</span>
          <input
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-black text-stone-900 placeholder:text-stone-300 border-none bg-transparent focus:ring-0 px-0 focus:outline-none"
            placeholder="記事のタイトルを入力..."
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">スラッグ (URL)</span>
            <button
              type="button"
              onClick={() => setSlug(slugify(title))}
              className="text-[10px] font-bold text-stone-400 hover:text-amber-600 transition-colors flex items-center gap-1 group"
            >
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              タイトルから生成
            </button>
          </div>
          <input
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full font-mono text-sm text-blue-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
            placeholder="example-article-slug"
          />
        </div>
      </div>

      {/* Toolbar / Options Area */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-5">
        <div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">サムネイル画像</span>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full max-w-md aspect-video rounded-xl border border-stone-200 overflow-hidden shadow-sm bg-stone-50">
              <ThumbnailImage
                src={(!removeThumbnail && (localPreviewUrl || getPublicThumbnailUrl(thumbnailUrl))) ? (localPreviewUrl || getPublicThumbnailUrl(thumbnailUrl) || '/images/no-image.png') : '/images/no-image.png'}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
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

              {isUploadingThumbnail && <p className="text-xs font-bold text-blue-600">アップロード中...</p>}
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
              initialSelectedItems={content.tagIds.map(id => {
                const tag = availableTags.find(t => t.id === id);
                return tag ? { id: tag.id, name: tag.name } : null;
              }).filter(Boolean) as { id: number, name: string }[]}
              nameForExisting="tagIds"
              nameForNew="newTags"
              placeholder="タグを検索または新規入力して追加..."
              allowMultipleNew={true}
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">カテゴリ</legend>
            <TagInput
              availableItems={availableCategories}
              initialSelectedItems={content.categoryIds.map(id => {
                const cat = availableCategories.find(c => c.id === id);
                return cat ? { id: cat.id, name: cat.label ?? cat.name } : null;
              }).filter(Boolean) as { id: number, name: string }[]}
              nameForExisting="categoryIds"
              nameForNew="newCategoryName"
              placeholder="カテゴリを検索または新規入力..."
              allowMultipleNew={false}
            />
          </fieldset>
        </div>

        <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canPublish ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input name="isPublished" type="checkbox" defaultChecked={content.isPublished} className="sr-only peer" />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-3 text-sm font-bold text-stone-700">記事を公開状態にする</span>
              </label>
            ) : (
              <span className="text-xs font-bold px-3 py-1 bg-stone-200 text-stone-500 rounded-md">
                公開設定は変更不可（権限がありません）
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Markdown Area */}
      <div>
        <div className="block space-y-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex justify-between">
            本文内容
          </span>
          <BlockEditor initialMarkdown={content.content} name="content" />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending || isUploadingThumbnail}
          className="bg-stone-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          {isUploadingThumbnail ? '画像アップロード中...' : isPending ? '保存中...' : '記事を更新する'}
        </button>
      </div>

      {state.error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl font-bold text-sm">
          {state.error}
        </div>
      )}

      {state.slug && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl font-bold text-sm">
          ✓ 更新完了: {state.title} (Slug: {state.slug})
        </div>
      )}
    </form>
  );
}
