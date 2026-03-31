'use client';

import { useActionState } from 'react';
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
    thumbnail: string;
    isPublished: boolean;
    tagIds: number[];
    categoryIds: number[];
  };
}) {
  const [state, action, isPending] = useActionState(updateContentAction, initialState);

  return (
    <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: '48rem' }}>
      <input type="hidden" name="session" value={sessionToken ?? ''} />
      <input type="hidden" name="contentId" value={content.id} />

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>タイトル</span>
        <input name="title" type="text" required defaultValue={content.title} />
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>スラッグ</span>
        <input name="slug" type="text" required defaultValue={content.slug} />
      </label>

      <input type="hidden" name="existingThumbnail" value={content.thumbnail} />

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>現在のサムネイル</span>
        <a href={content.thumbnail} target="_blank" rel="noreferrer" style={{ color: 'blue' }}>
          {content.thumbnail}
        </a>
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>新しいサムネイル画像</span>
        <input name="thumbnailFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        <small style={{ color: '#666' }}>差し替えない場合は未選択のままで大丈夫です。5MB以下。</small>
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

      <button type="submit" disabled={isPending} style={{ width: 'fit-content', padding: '0.5rem 1rem' }}>
        {isPending ? '保存中...' : '記事を更新する'}
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
