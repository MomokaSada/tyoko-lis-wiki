import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  theme?: 'blue' | 'emerald' | 'purple' | 'orange' | 'amber';
  /** true → 飾り棒グラフ、number[] → 実データの棒グラフ */
  miniChart?: boolean | number[];
  /** プログレスバーの値（0-100） */
  progress?: number;
  /** プログレスバーの色（themeがあればそちら優先） */
  progressColor?: string;
  /** トレンド表示バッジ（文字列指定、従来形式） */
  trend?: { value: string; positive?: boolean };
  /** トレンド表示バッジ（数値指定、自動で +/-% を整形） */
  trendValue?: number;
}

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-50 border border-blue-100 text-blue-500',
  emerald: 'bg-emerald-50 border border-emerald-100 text-emerald-500',
  purple: 'bg-purple-50 border border-purple-100 text-purple-500',
  orange: 'bg-orange-50 border border-orange-100 text-orange-500',
  amber: 'bg-amber-50 border border-amber-100 text-amber-500',
};

const progressBarColorMap: Record<string, string> = {
  blue: '#60a5fa',
  emerald: '#34d399',
  purple: '#a78bfa',
  orange: '#fb923c',
  amber: '#fbbf24',
};

const barColorMap: Record<string, string> = {
  blue: '#60a5fa',
  emerald: '#34d399',
  purple: '#a78bfa',
  orange: '#fb923c',
  amber: '#fbbf24',
};

/** 値を 0..100 に収め、高さを返す */
function barHeight(value: number, max: number): string {
  if (max <= 0) return '0%';
  const pct = (value / max) * 100;
  return `${Math.max(2, Math.min(100, pct))}%`;
}

export function StatCard({
  icon,
  label,
  value,
  subtext,
  theme = 'blue',
  miniChart = false,
  progress,
  trend,
  trendValue,
}: StatCardProps) {
  // trendValue が指定されている場合、自動整形する
  const resolvedTrend = trend ?? (trendValue !== undefined
    ? {
        value: `${trendValue >= 0 ? '+' : ''}${trendValue.toFixed(1)}%`,
        positive: trendValue >= 0,
      }
    : undefined);

  /** ミニグラフの最大値を求める */
  const chartData = Array.isArray(miniChart) ? miniChart : null;
  const chartMax = chartData ? Math.max(...chartData, 1) : 0;

  return (
    <div className="card-base bg-white border border-stone-200 rounded-xl sm:rounded-[1.5rem] p-4 sm:p-6">
      <div className="flex items-start justify-between mb-3 sm:mb-5">
        <div className={`w-11 sm:w-13 h-11 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center stat-icon ${iconBgMap[theme]}`}>
          {icon}
        </div>
        <span className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums truncate max-w-[50%] sm:max-w-none">{value}</span>
      </div>
      <h3 className="font-bold text-stone-800 text-sm sm:text-base mb-1">{label}</h3>
      {subtext && <p className="text-xs text-stone-400">{subtext}</p>}

      {/* ミニ棒グラフ */}
      {miniChart && (
        <div className="mt-4 flex items-end gap-1 h-10">
          {chartData ? (
            /* 実データの棒グラフ */
            chartData.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: barHeight(v, chartMax),
                  backgroundColor: barColorMap[theme] || '#94a3b8',
                  opacity: Math.max(0.35, v / chartMax),
                }}
              />
            ))
          ) : (
            /* 従来の飾り棒グラフ */
            <>
              <div className="flex-1 bg-blue-100 rounded-sm" style={{ height: '60%' }} />
              <div className="flex-1 bg-blue-100 rounded-sm" style={{ height: '80%' }} />
              <div className="flex-1 bg-blue-200 rounded-sm" style={{ height: '45%' }} />
              <div className="flex-1 bg-blue-200 rounded-sm" style={{ height: '90%' }} />
              <div className="flex-1 bg-blue-300 rounded-sm" style={{ height: '70%' }} />
              <div className="flex-1 bg-blue-400 rounded-sm" style={{ height: '55%' }} />
              <div className="flex-1 bg-blue-500 rounded-sm" style={{ height: '85%' }} />
            </>
          )}
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
                backgroundColor: progressBarColorMap[theme] || '#6b7280',
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-stone-500">{progress}%</span>
        </div>
      )}

      {/* トレンドバッジ */}
      {resolvedTrend && (
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          {resolvedTrend.positive !== false ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            </svg>
          )}
          {resolvedTrend.value}
        </div>
      )}
    </div>
  );
}
