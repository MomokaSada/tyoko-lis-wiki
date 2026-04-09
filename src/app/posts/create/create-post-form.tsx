'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
import {
  createContentAction,
  type ContentActionState,
} from '@/server/actions/contentActions';
import { ImagePlus, PlusCircle, RefreshCw, Save } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TagInput } from '@/components/ui/TagInput';
import { getPublicThumbnailUrl } from '@/lib/thumbnail-utils';
import { Modal } from '@/components/ui/Modal';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { slugify } from '@/lib/slug-utils';

const BlockEditor = dynamic(() => import('@/components/editor/BlockEditor'), { ssr: false, loading: () => <p className="p-8 text-stone-400 font-medium">エディタを読み込み中...</p> });

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

type TaxonomyOption = {
  id: number;
  name: string;
  label?: string;
  parentId?: number | null;
};

export function CreatePostForm({
  sessionToken,
  availableTagsJson,
  availableCategoriesJson,
}: {
  sessionToken: string | null;
  availableTagsJson: string;
  availableCategoriesJson: string;
}) {
  const [state, action, isPending] = useActionState(createContentAction, initialState);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  
  // Title & Slug Sync Logic
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto-sync slug from title if not manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setSlug(slugify(title));
    }
  }, [title, isSlugManuallyEdited]);

  // Cropping State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const availableTags = useMemo<TaxonomyOption[]>(() => {
    try {
      const parsed = JSON.parse(availableTagsJson) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          id: typeof item.id === 'number' ? item.id : 0,
          name: typeof item.name === 'string' ? item.name : '',
          label: typeof item.label === 'string' ? item.label : undefined,
          parentId:
            item.parentId === null || item.parentId === undefined
              ? null
              : typeof item.parentId === 'number'
                ? item.parentId
                : null,
        }));
    } catch {
      return [];
    }
  }, [availableTagsJson]);

  const availableCategories = useMemo<TaxonomyOption[]>(() => {
    try {
      const parsed = JSON.parse(availableCategoriesJson) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          id: typeof item.id === 'number' ? item.id : 0,
          name: typeof item.name === 'string' ? item.name : '',
          label: typeof item.label === 'string' ? item.label : undefined,
          parentId:
            item.parentId === null || item.parentId === undefined
              ? null
              : typeof item.parentId === 'number'
                ? item.parentId
                : null,
        }));
    } catch {
      return [];
    }
  }, [availableCategoriesJson]);

  const canPublish = sessionToken === null;

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
    <form action={action} className="space-y-8">
      <input type="hidden" name="session" value={sessionToken ?? ''} />
      <input type="hidden" name="thumbnail" value={thumbnailUrl} />

      {/* Main Metadata Area */}
      <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-8 relative overflow-hidden">
        <label className="block space-y-3">
          <span className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] ml-1">Article Title</span>
          <input 
            name="title" 
            type="text" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl md:text-5xl font-black text-stone-900 placeholder:text-stone-200 border-none bg-transparent focus:ring-0 px-0 focus:outline-none tracking-tighter"
            placeholder="記事のタイトルを入力..."
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <span className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">URL Slug</span>
            <button
              type="button"
              onClick={() => {
                setSlug(slugify(title));
                setIsSlugManuallyEdited(false);
              }}
              className="text-[10px] font-bold text-stone-400 hover:text-amber-600 transition-colors flex items-center gap-1.5 group"
              title="タイトルから再生成"
            >
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              Reset to Auto
            </button>
          </div>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 font-mono text-sm group-focus-within:text-amber-400 transition-colors">/posts/</span>
            <input 
              name="slug" 
              type="text" 
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugManuallyEdited(true);
              }}
              className="w-full font-mono text-sm text-amber-700 bg-stone-50/50 border border-stone-100 rounded-2xl pl-16 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-bold"
              placeholder="example-slug"
            />
          </div>
          {!isSlugManuallyEdited && title && (
            <p className="text-[10px] text-stone-400 font-bold ml-1 animate-pulse">✨ タイトルに合わせて自動更新中</p>
          )}
        </div>
      </div>

      {/* Options & Configuration */}
      <div className="bg-stone-50/50 border border-stone-200 rounded-[2rem] p-6 md:p-8 space-y-8">
        <div>
          <span className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] block mb-4 ml-1">サムネイル画像 / Thumbnail</span>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="relative w-full lg:w-[400px] aspect-video rounded-3xl border border-stone-200 overflow-hidden shadow-sm bg-white group">
              <ThumbnailImage 
                src={localPreviewUrl || getPublicThumbnailUrl(thumbnailUrl) || '/images/no-image.png'} 
                alt="Thumbnail preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {isUploadingThumbnail && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Uploading...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <label className="cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-white border border-stone-200 text-stone-700 rounded-2xl hover:bg-stone-50 transition-all text-sm font-black shadow-sm group active:scale-95">
                <ImagePlus className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                画像をアップロード
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              
              <div className="space-y-1 ml-1">
                {(localPreviewUrl || thumbnailUrl) && !isUploadingThumbnail && (
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    Upload Complete
                  </p>
                )}
                <p className="text-[10px] text-stone-400 font-bold leading-relaxed">
                  推奨: 1280x720 (16:9) / 5MB以下 / PNG, JPEG, WEBP<br />
                  選択した画像は自動的に16:9でトリミングされます。
                </p>
              </div>
              {thumbnailError && <p className="text-xs font-bold text-red-600">{thumbnailError}</p>}
            </div>
          </div>
        </div>

        {/* Taxonomy selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-stone-200/60">
          <div className="space-y-4">
            <span className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] block ml-1">カテゴリ / Category</span>
            <TagInput
              availableItems={availableCategories}
              nameForExisting="categoryIds"
              nameForNew="newCategoryName"
              placeholder="カテゴリを検索または新規入力..."
              allowMultipleNew={false}
            />
            <div className="relative">
               <select name="newCategoryParentId" defaultValue="" className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer">
                  <option value="">(新規カテゴリの場合は親を選択...)</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={String(category.id)}>{category.label || category.name}</option>
                  ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                  <PlusCircle className="w-3.5 h-3.5" />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] block ml-1">タグ / Tags</span>
            <TagInput
              availableItems={availableTags}
              nameForExisting="tagIds"
              nameForNew="newTags"
              placeholder="タグを検索または新規入力して追加..."
              allowMultipleNew={true}
            />
          </div>
        </div>

        <div className="pt-8 border-t border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {canPublish ? (
              <label className="relative inline-flex items-center cursor-pointer group">
                <input name="isPublished" type="checkbox" defaultChecked={true} className="sr-only peer" />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-3 text-xs font-black text-stone-600 uppercase tracking-widest group-hover:text-amber-600 transition-colors">公開状態で保存</span>
              </label>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg border border-stone-200">
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">下書き（編集セッション）</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white border border-stone-200 rounded-[2.5rem] p-1 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-stone-100">
          <span className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] block">記事本文 / Content</span>
        </div>
        <BlockEditor initialMarkdown="" name="content" />
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending || isUploadingThumbnail}
          className="bg-stone-900 text-white font-black px-10 py-4 rounded-[1.5rem] hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-3 text-sm tracking-widest uppercase hover:gap-4 duration-300"
        >
          {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isUploadingThumbnail ? 'Uploading...' : isPending ? 'Creating...' : '記事を作成・公開する'}
        </button>
      </div>

      {state.error && (
        <div className="bg-red-50 text-red-700 border border-red-100 p-6 rounded-3xl font-bold text-sm animate-in shake-in duration-300">
          ⚠️ {state.error}
        </div>
      )}

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
    </form>
  );
}
