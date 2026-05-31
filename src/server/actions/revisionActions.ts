'use server';

import { getCurrentActor } from '@/server/lib/currentActor';
import { getRevisionDiffData } from '@/server/services/revisionService';
import type { DiffPart, TagCategoryDiff } from '@/server/services/revisionService';

/**
 * 指定されたリビジョンの差分を取得する (Server Action)。
 *
 * この Action は認可 (owner のみ) と Service 層への委譲のみを行い、
 * DB クエリや diff 計算は Service / Repository 層に分離している。
 */
export async function getRevisionDiff(
  contentId: number,
  revisionNumber: number,
): Promise<{
  oldTitle: string | null;
  newTitle: string | null;
  titleDiff: DiffPart[];
  bodyDiff: DiffPart[];
  oldThumbnail: string | null;
  newThumbnail: string | null;
  thumbnailChanged: boolean;
  tagDiff: TagCategoryDiff;
  categoryDiff: TagCategoryDiff;
} | null> {
  const actor = await getCurrentActor();
  if (actor?.role !== 'owner') return null;

  return getRevisionDiffData(contentId, revisionNumber);
}
