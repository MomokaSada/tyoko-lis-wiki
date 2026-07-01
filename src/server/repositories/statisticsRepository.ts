import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { contents, contentViewStats, users } from '@/db/schema';

// ---------------------------------------------------------------------------
// Admin ダッシュボード用 一括取得（5クエリ→2クエリに統合）
// ---------------------------------------------------------------------------

export type AdminDashboardRaw = {
  thisMonthPosts: number;
  lastMonthPosts: number;
  last30Total: number;
  prev30Total: number;
};

/**
 * Admin ダッシュボードの集計値を1回のSQLで取得する。
 * 従来は個別クエリ×5回発行していたが、サブクエリに統合してラウンドトリップを削減。
 */
export async function getAdminDashboardAggregates(
  monthStart: Date,
  lastMonthStart: Date,
  thirtyDaysAgo: string,
  sixtyDaysAgo: string,
): Promise<AdminDashboardRaw> {
  const [row] = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM "contents" WHERE "created_at" >= ${monthStart}) AS "this_month_posts",
      (SELECT count(*) FROM "contents" WHERE "created_at" >= ${lastMonthStart} AND "created_at" < ${monthStart}) AS "last_month_posts",
      (SELECT coalesce(sum("view_count"), 0) FROM "content_view_stats" WHERE "date" >= ${thirtyDaysAgo}) AS "last30_total",
      (SELECT coalesce(sum("view_count"), 0) FROM "content_view_stats" WHERE "date" >= ${sixtyDaysAgo} AND "date" < ${thirtyDaysAgo}) AS "prev30_total"
  `);

  return {
    thisMonthPosts: Number(row?.this_month_posts ?? 0),
    lastMonthPosts: Number(row?.last_month_posts ?? 0),
    last30Total: Number(row?.last30_total ?? 0),
    prev30Total: Number(row?.prev30_total ?? 0),
  };
}

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
