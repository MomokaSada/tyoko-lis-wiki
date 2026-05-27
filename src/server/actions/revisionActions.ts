'use server';

import { eq, and, inArray } from 'drizzle-orm';
import { diffWords, diffLines } from 'diff';
import { db } from '@/db';
import { contentEditLogs, contentEditLogTags, contentEditLogCategories, tags, categories } from '@/db/schema';
import { getCurrentActor } from '@/server/lib/currentActor';

export type DiffPart = { value: string; added?: boolean; removed?: boolean };

export type TagCategoryDiff = {
  added: { id: number; name: string }[];
  removed: { id: number; name: string }[];
};

async function getTagNames(editLogId: number): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: tags.id, name: tags.name })
    .from(contentEditLogTags)
    .innerJoin(tags, eq(contentEditLogTags.tagId, tags.id))
    .where(eq(contentEditLogTags.editLogId, editLogId));
}

async function getCategoryNames(editLogId: number): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(contentEditLogCategories)
    .innerJoin(categories, eq(contentEditLogCategories.categoryId, categories.id))
    .where(eq(contentEditLogCategories.editLogId, editLogId));
}

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

export async function getRevisionDiff(
  contentId: number,
  revisionNumber: number,
): Promise<{
  oldTitle: string | null;
  newTitle: string | null;
  titleDiff: DiffPart[];
  bodyDiff: DiffPart[];
  tagDiff: TagCategoryDiff;
  categoryDiff: TagCategoryDiff;
} | null> {
  const actor = await getCurrentActor();
  if (actor?.role !== 'owner') return null;

  const current = await db
    .select({ id: contentEditLogs.id, title: contentEditLogs.title, data: contentEditLogs.data })
    .from(contentEditLogs)
    .where(
      and(
        eq(contentEditLogs.contentId, contentId),
        eq(contentEditLogs.revisionNumber, revisionNumber),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!current) return null;

  const previous = await db
    .select({ id: contentEditLogs.id, title: contentEditLogs.title, data: contentEditLogs.data })
    .from(contentEditLogs)
    .where(
      and(
        eq(contentEditLogs.contentId, contentId),
        eq(contentEditLogs.revisionNumber, revisionNumber - 1),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  // タグ・カテゴリの変更を取得
  const [currentTags, previousTags, currentCategories, previousCategories] = await Promise.all([
    getTagNames(current.id),
    previous ? getTagNames(previous.id) : [],
    getCategoryNames(current.id),
    previous ? getCategoryNames(previous.id) : [],
  ]);

  return {
    oldTitle: previous?.title ?? null,
    newTitle: current.title,
    titleDiff: previous
      ? diffWords(previous.title ?? '', current.title ?? '')
      : [{ value: current.title ?? '' }],
    bodyDiff: previous
      ? diffLines(previous.data ?? '', current.data ?? '')
      : [{ value: current.data ?? '' }],
    tagDiff: computeDiff(previousTags, currentTags),
    categoryDiff: computeDiff(previousCategories, currentCategories),
  };
}
