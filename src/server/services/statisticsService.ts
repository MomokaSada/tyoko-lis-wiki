/**
 * ダッシュボード用の統計情報を提供する Service。
 * DB クエリは Repository 層に委譲し、この Service は集約と権限チェックのみを行う。
 */
import { gte, sql, eq, and, lt } from 'drizzle-orm';
import { db } from '@/db';
import { contents, contentViewStats, users } from '@/db/schema';

export type OwnerDashboardStats = {
  todayUsers: number;
  totalUsers: number;
  totalContents: number;
  publishedContents: number;
};

export type AdminDashboardStats = {
  thisMonthPosts: number;
  lastMonthPosts: number;
  last30ViewTotal: number;
  prev30ViewTotal: number;
  viewTrend: number;
  last7Chart: number[];
};

/** Owner ダッシュボード用の統計情報を取得する */
export async function getOwnerDashboardStats(): Promise<OwnerDashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayUsersRows, totalUsersRows, totalContentsRows, publishedContentsRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, todayStart)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(eq(contents.isPublished, true)),
  ]);

  return {
    todayUsers: Number(todayUsersRows[0]?.count ?? 0),
    totalUsers: Number(totalUsersRows[0]?.count ?? 0),
    totalContents: Number(totalContentsRows[0]?.count ?? 0),
    publishedContents: Number(publishedContentsRows[0]?.count ?? 0),
  };
}

/** Admin ダッシュボード用の統計情報を取得する */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);

  const [thisMonthPosts, lastMonthPosts, last30Rows, prev30Rows, last7Rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(gte(contents.createdAt, monthStart)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(and(gte(contents.createdAt, lastMonthStart), lt(contents.createdAt, monthStart))),
    db
      .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(gte(contentViewStats.date, thirtyDaysAgo)),
    db
      .select({ total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(and(gte(contentViewStats.date, sixtyDaysAgo), lt(contentViewStats.date, thirtyDaysAgo))),
    db
      .select({ date: contentViewStats.date, total: sql<number>`coalesce(sum(${contentViewStats.viewCount}),0)` })
      .from(contentViewStats)
      .where(gte(contentViewStats.date, new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)))
      .groupBy(contentViewStats.date)
      .orderBy(contentViewStats.date),
  ]);

  const last30Total = last30Rows[0]?.total ?? 0;
  const prev30Total = prev30Rows[0]?.total ?? 0;
  const viewTrend = prev30Total > 0 ? ((last30Total - prev30Total) / prev30Total) * 100 : 0;

  // 7日間の日別ビューを配列に（データがない日は0）
  const last7Chart: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const row = last7Rows.find((r) => r.date === d);
    last7Chart.push(Number(row?.total ?? 0));
  }

  return {
    thisMonthPosts: Number(thisMonthPosts[0]?.count ?? 0),
    lastMonthPosts: Number(lastMonthPosts[0]?.count ?? 0),
    last30ViewTotal: last30Total,
    prev30ViewTotal: prev30Total,
    viewTrend,
    last7Chart,
  };
}
