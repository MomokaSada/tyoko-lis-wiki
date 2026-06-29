import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { contents, contentViewStats, users } from '@/db/schema';

// ---------------------------------------------------------------------------
// Owner ダッシュボード用
// ---------------------------------------------------------------------------

export async function countTodayUsers(todayStart: Date) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, todayStart));
  return Number(row?.count ?? 0);
}

export async function countTotalUsers() {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  return Number(row?.count ?? 0);
}

export async function countTotalContents() {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contents);
  return Number(row?.count ?? 0);
}

export async function countPublishedContents() {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contents)
    .where(eq(contents.isPublished, true));
  return Number(row?.count ?? 0);
}

// ---------------------------------------------------------------------------
// Admin ダッシュボード用
// ---------------------------------------------------------------------------

export async function countContentsSince(date: Date) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contents)
    .where(gte(contents.createdAt, date));
  return Number(row?.count ?? 0);
}

export async function countContentsBetween(start: Date, end: Date) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contents)
    .where(and(gte(contents.createdAt, start), lt(contents.createdAt, end)));
  return Number(row?.count ?? 0);
}

export async function sumViewCountSince(date: string) {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
    .from(contentViewStats)
    .where(gte(contentViewStats.date, date));
  return Number(row?.total ?? 0);
}

export async function sumViewCountBetween(start: string, end: string) {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
    .from(contentViewStats)
    .where(and(gte(contentViewStats.date, start), lt(contentViewStats.date, end)));
  return Number(row?.total ?? 0);
}

export type DailyViewRow = { date: string; total: number };

/** 公開済み記事の合計ビュー数を取得（Admin ダッシュボード用） */
export async function sumPublishedViewCount() {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${contents.viewCount}),0)` })
    .from(contents)
    .where(eq(contents.isPublished, true));
  return Number(row?.total ?? 0);
}

export async function sumViewCountGroupedByDateSince(date: string): Promise<DailyViewRow[]> {
  const rows = await db
    .select({
      date: contentViewStats.date,
      total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)`,
    })
    .from(contentViewStats)
    .where(gte(contentViewStats.date, date))
    .groupBy(contentViewStats.date)
    .orderBy(contentViewStats.date);

  return rows.map((r) => ({ date: r.date, total: Number(r.total ?? 0) }));
}
