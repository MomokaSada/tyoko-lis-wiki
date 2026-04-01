'use client';

import { useActionState, useState } from 'react';
import {
  createContentAction,
  type CreateContentActionState,
} from '@/server/actions/contentActions';

const initialState: CreateContentActionState = {
  error: null,
  createdSlug: null,
  createdTitle: null,
};

type TaxonomyOption = {
  id: number;
  name: string;
  label?: string;
  parentId?: number | null;
};

export function CreatePostForm({
  sessionToken,
  availableTags,
  availableCategories,
}: {
  sessionToken: string | null;
  availableTags: TaxonomyOption[];
  availableCategories: TaxonomyOption[];
}) {
  const [state, action, isPending] = useActionState(createContentAction, initialState);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const canPublish = sessionToken === null;

  async function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      setThumbnailUrl('');
      setThumbnailError(null);
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
    } catch (error) {
      setThumbnailUrl('');
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
      <input type="hidden" name="thumbnail" value={thumbnailUrl} />

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>タイトル</span>
        <input name="title" type="text" required />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>スラッグ（未入力ならタイトルから自動生成）</span>
        <input name="slug" type="text" />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>サムネイル画像</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleThumbnailChange}
        />
        <small style={{ color: '#666' }}>任意設定。JPEG / PNG / WEBP / GIF、5MB以下</small>
        {isUploadingThumbnail && <small style={{ color: '#1d4ed8' }}>アップロード中...</small>}
        {!isUploadingThumbnail && thumbnailUrl && (
          <small style={{ color: '#15803d' }}>アップロード完了: {thumbnailUrl}</small>
        )}
        {thumbnailError && <small style={{ color: '#b00020' }}>{thumbnailError}</small>}
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>本文</span>
        <textarea name="content" rows={12} required />
      </label>

      <fieldset style={{ display: 'grid', gap: '0.5rem' }}>
        <legend>タグ</legend>
        {availableTags.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {availableTags.map((tag) => (
              <label key={tag.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <input type="checkbox" name="tagIds" value={tag.id} />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#666' }}>登録済みタグはまだありません。</p>
        )}
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span>新規タグ（カンマ区切り）</span>
          <input name="newTags" type="text" placeholder="例: 麻雀, 攻略, 初心者向け" />
        </label>
      </fieldset>

      <fieldset style={{ display: 'grid', gap: '0.5rem' }}>
        <legend>カテゴリ</legend>
        {availableCategories.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            {availableCategories.map((category) => (
              <label key={category.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <input type="checkbox" name="categoryIds" value={category.id} />
                <span>{category.label ?? category.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#666' }}>登録済みカテゴリはまだありません。</p>
        )}
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span>新規カテゴリ名</span>
          <input name="newCategoryName" type="text" placeholder="例: キャラクター" />
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
          <input name="isPublished" type="checkbox" />
          <span>公開状態で作成する</span>
        </label>
      ) : (
        <p style={{ margin: 0, color: '#555' }}>
          編集セッション経由の作成では、公開状態の切り替えはできません。
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || isUploadingThumbnail}
        style={{ width: 'fit-content', padding: '0.5rem 1rem' }}
      >
        {isUploadingThumbnail ? '画像アップロード中...' : isPending ? '作成中...' : '記事を作成する'}
      </button>

      {state.error && <p style={{ color: '#b00020' }}>{state.error}</p>}

      {state.createdSlug && (
        <div style={{ padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>作成完了:</strong> {state.createdTitle}</p>
          <p><strong>スラッグ:</strong> <code>{state.createdSlug}</code></p>
        </div>
      )}
    </form>
  );
}
