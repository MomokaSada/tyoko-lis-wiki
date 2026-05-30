import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  contents,
  contentEditLogs,
  contentEditLogTags,
  contentEditLogCategories,
  tags,
  categories,
} from '@/db/schema';

export type EditLogRow = {
  id: number;
  title: string | null;
  data: string | null;
  thumbnail: string | null;
};

/** 指定されたリビジョンの編集ログを取得する */
export async function findEditLog(
  contentId: number,
  revisionNumber: number,
): Promise<EditLogRow | null> {
  return db
    .select({
      id: contentEditLogs.id,
      title: contentEditLogs.title,
      data: contentEditLogs.data,
      thumbnail: contentEditLogs.thumbnail,
    })
    .from(contentEditLogs)
    .where(
      and(
        eq(contentEditLogs.contentId, contentId),
        eq(contentEditLogs.revisionNumber, revisionNumber),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

/** コンテンツの現在のサムネイルを取得する */
export async function findCurrentThumbnail(
  contentId: number,
): Promise<string | null> {
  return db
    .select({ currentThumbnail: contents.currentThumbnail })
    .from(contents)
    .where(eq(contents.id, contentId))
    .limit(1)
    .then((rows) => rows[0]?.currentThumbnail ?? null);
}

/** 編集ログに紐づくタグ名一覧を取得する */
export async function findTagNames(
  editLogId: number,
): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: tags.id, name: tags.name })
    .from(contentEditLogTags)
    .innerJoin(tags, eq(contentEditLogTags.tagId, tags.id))
    .where(eq(contentEditLogTags.editLogId, editLogId));
}

/** 編集ログに紐づくカテゴリ名一覧を取得する */
export async function findCategoryNames(
  editLogId: number,
): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(contentEditLogCategories)
    .innerJoin(categories, eq(contentEditLogCategories.categoryId, categories.id))
    .where(eq(contentEditLogCategories.editLogId, editLogId));
}
