'use client';

import { useActionState, useState } from 'react';
import {
  updateContentAction,
  type UpdateContentActionState,
} from '@/server/actions/contentActions';

const initialState: UpdateContentActionState = {
  error: null,
  updatedSlug: null,
  updatedTitle: null,
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
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  async function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingThumbnail(true);
    setThumbnailError(null);

    try {
      const formData = new FormData();
      formData.set('file', file);

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
    <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: '48rem' }}>
      <input type="hidden" name="session" value={sessionToken ?? ''} />
      <input type="hidden" name="contentId" value={content.id} />
      <input type="hidden" name="thumbnail" value={removeThumbnail ? '' : thumbnailUrl} />

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>タイトル</span>
        <input name="title" type="text" required defaultValue={content.title} />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>スラッグ</span>
        <input name="slug" type="text" required defaultValue={content.slug} />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>現在のサムネイル</span>
        {thumbnailUrl && !removeThumbnail ? (
          <a href={thumbnailUrl} target="_blank" rel="noreferrer" style={{ color: 'blue' }}>
            {thumbnailUrl}
          </a>
        ) : (
          <span style={{ color: '#666' }}>未設定</span>
        )}
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>新しいサムネイル画像</span>
        <input
          name="thumbnailFile"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleThumbnailChange}
        />
        <small style={{ color: '#666' }}>差し替えない場合は未選択のままで大丈夫です。5MB以下。</small>
        {isUploadingThumbnail && <small style={{ color: '#1d4ed8' }}>アップロード中...</small>}
        {thumbnailError && <small style={{ color: '#b00020' }}>{thumbnailError}</small>}
      </label>

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          name="removeThumbnail"
          type="checkbox"
          checked={removeThumbnail}
          onChange={(event) => setRemoveThumbnail(event.currentTarget.checked)}
        />
        <span>サムネイルを削除する</span>
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>本文</span>
        <textarea name="content" rows={12} required defaultValue={content.content} />
      </label>

      <fieldset style={{ display: 'grid', gap: '0.5rem' }}>
        <legend>タグ</legend>
        {availableTags.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {availableTags.map((tag) => (
              <label key={tag.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={content.tagIds.includes(tag.id)}
                />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#666' }}>登録済みタグはまだありません。</p>
        )}
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span>新規タグ（カンマ区切り）</span>
          <input name="newTags" type="text" placeholder="例: 更新履歴, 注目" />
        </label>
      </fieldset>

      <fieldset style={{ display: 'grid', gap: '0.5rem' }}>
        <legend>カテゴリ</legend>
        {availableCategories.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            {availableCategories.map((category) => (
              <label key={category.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={content.categoryIds.includes(category.id)}
                />
                <span>{category.label ?? category.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#666' }}>登録済みカテゴリはまだありません。</p>
        )}
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span>新規カテゴリ名</span>
          <input name="newCategoryName" type="text" placeholder="例: 役・ルール" />
        </label>
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span>新規カテゴリの親カテゴリ</span>
          <select name="newCategoryParentId" defaultValue="">
            <option value="">親カテゴリなし</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label ?? category.name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      {canPublish ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input name="isPublished" type="checkbox" defaultChecked={content.isPublished} />
          <span>公開状態</span>
        </label>
      ) : (
        <p style={{ margin: 0, color: '#555' }}>
          編集セッション経由では公開状態を変更できません。
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || isUploadingThumbnail}
        style={{ width: 'fit-content', padding: '0.5rem 1rem' }}
      >
        {isUploadingThumbnail ? '画像アップロード中...' : isPending ? '保存中...' : '記事を更新する'}
      </button>

      {state.error && <p style={{ color: '#b00020' }}>{state.error}</p>}

      {state.updatedSlug && (
        <div style={{ padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>更新完了:</strong> {state.updatedTitle}</p>
          <p><strong>スラッグ:</strong> <code>{state.updatedSlug}</code></p>
        </div>
      )}
    </form>
  );
}
