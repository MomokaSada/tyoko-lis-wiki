import { diffWords, diffLines } from 'diff';
import { findCurrentThumbnail } from '@/server/repositories/contentRepository';
import { findEditLog } from '@/server/repositories/revisionRepository';
import {
    findTagNames,
    findCategoryNames,
} from '@/server/repositories/taxonomyRepository';
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DiffPart = { value: string; added?: boolean; removed?: boolean };

export type TagCategoryDiff = {
  added: { id: number; name: string }[];
  removed: { id: number; name: string }[];
};

export interface RevisionDiffResult {
  oldTitle: string | null;
  newTitle: string | null;
  titleDiff: DiffPart[];
  bodyDiff: DiffPart[];
  oldThumbnail: string | null;
  newThumbnail: string | null;
  thumbnailChanged: boolean;
  tagDiff: TagCategoryDiff;
  categoryDiff: TagCategoryDiff;
}

// ---------------------------------------------------------------------------
// Pure helpers (no DB)
// ---------------------------------------------------------------------------

function computeDiff(
  oldItems: { id: number; name: string }[],
  newItems: { id: number; name: string }[],
): TagCategoryDiff {
  const oldIds = new Set(oldItems.map((i) => i.id));
  const newIds = new Set(newItems.map((i) => i.id));
  return {
    added: newItems.filter((i) => !oldIds.has(i.id)),
    removed: oldItems.filter((i) => !newIds.has(i.id)),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * 指定されたリビジョンの差分データを取得する。
 * - DB への問合せは Repository 層に委譲
 * - diff 計算は純粋関数として分離
 */
export async function getRevisionDiffData(
  contentId: number,
  revisionNumber: number,
): Promise<RevisionDiffResult | null> {
  const current = await findEditLog(contentId, revisionNumber);
  if (!current) return null;

  const [previous, contentThumbnail] = await Promise.all([
    findEditLog(contentId, revisionNumber - 1),
    findCurrentThumbnail(contentId),
  ]);

  // タグ・カテゴリの変更を取得
  const [currentTags, previousTags, currentCategories, previousCategories] =
    await Promise.all([
      findTagNames(current.id),
      previous ? findTagNames(previous.id) : [],
      findCategoryNames(current.id),
      previous ? findCategoryNames(previous.id) : [],
    ]);

  // 両方の edit log で thumbnail が null なら、コンテンツの現在値で表示
  const rawOld = previous?.thumbnail ?? null;
  const rawNew = current.thumbnail;
  const bothNull = rawOld === null && rawNew === null;

  const oldThumbnail = bothNull ? contentThumbnail : rawOld;
  const newThumbnail = bothNull ? contentThumbnail : rawNew;

  return {
    oldTitle: previous?.title ?? null,
    newTitle: current.title,
    titleDiff: previous
      ? diffWords(previous.title ?? '', current.title ?? '')
      : [{ value: current.title ?? '' }],
    bodyDiff: previous
      ? diffLines(previous.data ?? '', current.data ?? '')
      : [{ value: current.data ?? '' }],
    oldThumbnail,
    newThumbnail,
    thumbnailChanged: oldThumbnail !== newThumbnail,
    tagDiff: computeDiff(previousTags, currentTags),
    categoryDiff: computeDiff(previousCategories, currentCategories),
  };
}
