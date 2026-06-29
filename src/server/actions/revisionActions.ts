'use server';

import { getRevisionDiffData } from '@/server/services/revisionService';
import {
    DiffPart,
    TagCategoryDiff,
} from '@/server/services/revisionService';

/**
 * 指定されたリビジョンの差分を取得する (Server Action)。
 *
 * 記事の内容は公開情報であり、差分表示も公開とする。
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
  return getRevisionDiffData(contentId, revisionNumber);
}
