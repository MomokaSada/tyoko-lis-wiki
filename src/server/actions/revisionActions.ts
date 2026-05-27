'use server';

import { eq, and } from 'drizzle-orm';
import { diffWords, diffLines } from 'diff';
import { db } from '@/db';
import { contentEditLogs } from '@/db/schema';
import { getCurrentActor } from '@/server/lib/currentActor';

export type DiffPart = { value: string; added?: boolean; removed?: boolean };

export async function getRevisionDiff(
  contentId: number,
  revisionNumber: number,
): Promise<{
  oldTitle: string | null;
  newTitle: string | null;
  titleDiff: DiffPart[];
  bodyDiff: DiffPart[];
} | null> {
  const actor = await getCurrentActor();
  if (actor?.role !== 'owner') return null;

  const current = await db
    .select({ title: contentEditLogs.title, data: contentEditLogs.data })
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
    .select({ title: contentEditLogs.title, data: contentEditLogs.data })
    .from(contentEditLogs)
    .where(
      and(
        eq(contentEditLogs.contentId, contentId),
        eq(contentEditLogs.revisionNumber, revisionNumber - 1),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  return {
    oldTitle: previous?.title ?? null,
    newTitle: current.title,
    titleDiff: previous
      ? diffWords(previous.title ?? '', current.title ?? '')
      : [{ value: current.title ?? '' }],
    bodyDiff: previous
      ? diffLines(previous.data ?? '', current.data ?? '')
      : [{ value: current.data ?? '' }],
  };
}
