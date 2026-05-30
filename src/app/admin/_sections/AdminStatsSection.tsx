import React from 'react';
import { Link as LinkIcon, FileText, Calendar, Eye } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

interface AdminStatsSectionProps {
  totalPosts: number;
  publishedCount: number;
  activeEditLinks: number;
  editSessionsCount: number;
  thisMonthCount: number;
  lastMonthCount: number;
  publishedPostsViewCount: string;
  viewTrend: number;
  last7Chart: number[];
}

/**
 * 管理ダッシュボードの統計カードセクション
 * 全項目数、編集リンク、今月の投稿、閲覧数を表示する
 */
export function AdminStatsSection({
  totalPosts,
  publishedCount,
  activeEditLinks,
  editSessionsCount,
  thisMonthCount,
  lastMonthCount,
  publishedPostsViewCount,
  viewTrend,
  last7Chart,
}: AdminStatsSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          label="全項目数"
          value={totalPosts}
          subtext={`公開: ${publishedCount} | 下書き: ${totalPosts - publishedCount}`}
          theme="blue"
          miniChart={last7Chart}
        />
        <StatCard
          icon={<LinkIcon className="w-6 h-6" />}
          label="アクティブ編集リンク"
          value={activeEditLinks}
          subtext={`合計 ${editSessionsCount} 件中`}
          theme="emerald"
          progress={editSessionsCount > 0 ? Math.round((activeEditLinks / editSessionsCount) * 100) : 0}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="今月の投稿"
          value={thisMonthCount}
          subtext={lastMonthCount > 0 ? `先月: ${lastMonthCount}件` : ''}
          theme="purple"
          progress={lastMonthCount > 0 ? Math.min(100, Math.round((thisMonthCount / lastMonthCount) * 100)) : 100}
        />
        <StatCard
          icon={<Eye className="w-6 h-6" />}
          label="総閲覧数"
          value={publishedPostsViewCount}
          subtext="公開項目のみ"
          theme="orange"
          trendValue={viewTrend}
        />
      </div>
    </section>
  );
}
