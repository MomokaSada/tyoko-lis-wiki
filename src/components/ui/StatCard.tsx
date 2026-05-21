import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  theme?: 'blue' | 'emerald' | 'purple' | 'orange' | 'amber';
  /** ミニ棒グラフ表示（週間トレンドなど） */
  miniChart?: boolean;
  /** プログレスバーの値（0-100） */
  progress?: number;
  /** プログレスバーの色（themeがあればそちら優先） */
  progressColor?: string;
  /** トレンド表示バッジ */
  trend?: { value: string; positive?: boolean };
}

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-50 border border-blue-100 text-blue-500',
  emerald: 'bg-emerald-50 border border-emerald-100 text-emerald-500',
  purple: 'bg-purple-50 border border-purple-100 text-purple-500',
  orange: 'bg-orange-50 border border-orange-100 text-orange-500',
  amber: 'bg-amber-50 border border-amber-100 text-amber-500',
};

const progressBarMap: Record<string, string> = {
  blue: 'bg-blue-400',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
};

export function StatCard({
  icon,
  label,
  value,
  subtext,
  theme = 'blue',
  miniChart = false,
  progress,
  trend,
}: StatCardProps) {
  return (
    <div className="card-base bg-white border border-stone-200 rounded-[1.5rem] p-6">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center stat-icon ${iconBgMap[theme]}`}>
          {icon}
        </div>
        <span className="text-3xl font-black text-stone-900 tabular-nums">{value}</span>
      </div>
      <h3 className="font-bold text-stone-800 text-base mb-1">{label}</h3>
      {subtext && <p className="text-xs text-stone-400">{subtext}</p>}

      {/* ミニ棒グラフ */}
      {miniChart && (
        <div className="mt-4 flex items-end gap-1 h-10">
          <div className="flex-1 bg-blue-100 rounded-sm" style={{ height: '60%' }}></div>
          <div className="flex-1 bg-blue-100 rounded-sm" style={{ height: '80%' }}></div>
          <div className="flex-1 bg-blue-200 rounded-sm" style={{ height: '45%' }}></div>
          <div className="flex-1 bg-blue-200 rounded-sm" style={{ height: '90%' }}></div>
          <div className="flex-1 bg-blue-300 rounded-sm" style={{ height: '70%' }}></div>
          <div className="flex-1 bg-blue-400 rounded-sm" style={{ height: '55%' }}></div>
          <div className="flex-1 bg-blue-500 rounded-sm" style={{ height: '85%' }}></div>
        </div>
      )}

      {/* プログレスバー */}
      {progress !== undefined && (
        <div className="mt-4 flex gap-1.5 items-center">
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="progress-fill h-full rounded-full"
              style={{
                width: `${Math.min(100, progress)}%`,
                backgroundColor: progressBarMap[theme] || '#6b7280',
              }}
            ></div>
          </div>
          <span className="text-[10px] font-bold text-stone-500">{progress}%</span>
        </div>
      )}

      {/* トレンドバッジ */}
      {trend && (
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          {trend.positive !== false ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            </svg>
          )}
          {trend.value}
        </div>
      )}
    </div>
  );
}
