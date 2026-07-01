/**
 * ダッシュボード用の統計情報を提供する Service。
 * DB クエリは Repository 層に委譲し、この Service は集約と権限チェックのみを行う。
 */
import {
  countTodayUsers,
  countTotalUsers,
  countTotalContents,
  countPublishedContents,
  countContentsSince,
  countContentsBetween,
  sumViewCountSince,
  sumViewCountBetween,
  sumPublishedViewCount,
  sumViewCountGroupedByDateSince,
  getAdminDashboardAggregates,
} from '@/server/repositories/statisticsRepository';

export type OwnerDashboardStats = {
  todayUsers: number;
  totalUsers: number;
  totalContents: number;
  publishedContents: number;
};

/** Admin ダッシュボードの公開記事合計ビュー数を取得 */
export async function getPublishedPostsViewCount(): Promise<number> {
  return sumPublishedViewCount();
}

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

  const [todayUsers, totalUsers, totalContents, publishedContents] = await Promise.all([
    countTodayUsers(todayStart),
    countTotalUsers(),
    countTotalContents(),
    countPublishedContents(),
  ]);

  return {
    todayUsers,
    totalUsers,
    totalContents,
    publishedContents,
  };
}

/** Admin ダッシュボード用の統計情報を取得する。
 *
 * パフォーマンス: 5回の個別クエリを以下の2回に削減:
 *   1. `getAdminDashboardAggregates()` — 4つの集計をサブクエリ統合
 *   2. `sumViewCountGroupedByDateSince()` — 7日間チャート用
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

  const [agg, last7Rows] = await Promise.all([
    getAdminDashboardAggregates(monthStart, lastMonthStart, thirtyDaysAgo, sixtyDaysAgo),
    sumViewCountGroupedByDateSince(sevenDaysAgo),
  ]);

  const viewTrend = agg.prev30Total > 0
    ? ((agg.last30Total - agg.prev30Total) / agg.prev30Total) * 100
    : 0;

  // 7日間の日別ビューを配列に（データがない日は0）
  const last7Chart: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const found = last7Rows.find((r) => r.date === d);
    last7Chart.push(found?.total ?? 0);
  }

  return {
    thisMonthPosts: agg.thisMonthPosts,
    lastMonthPosts: agg.lastMonthPosts,
    last30ViewTotal: agg.last30Total,
    prev30ViewTotal: agg.prev30Total,
    viewTrend,
    last7Chart,
  };
}
