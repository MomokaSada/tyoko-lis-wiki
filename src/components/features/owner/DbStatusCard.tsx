'use client';

import { Database, Wifi, WifiOff, Activity } from 'lucide-react';

type DbHealthStatus = {
  isConnected: boolean;
  latencyMs: number | null;
  error: string | null;
  dbName: string | null;
};

export function DbStatusCard({ status }: { status: DbHealthStatus }) {
  const latencyColor =
    status.latencyMs === null
      ? 'text-stone-500'
      : status.latencyMs < 5
        ? 'text-emerald-400'
        : status.latencyMs < 20
          ? 'text-amber-400'
          : 'text-red-400';

  return (
    <div className="card-base bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border border-stone-700 rounded-[1.75rem] p-6 overflow-hidden relative">
      {/* 光彩 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-stone-700/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* ヘッダー */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-5 border"
            style={{
              backgroundColor: status.isConnected ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.15)',
              color: status.isConnected ? '#22d3ee' : '#fca5a5',
              borderColor: status.isConnected ? 'rgba(6,182,212,0.3)' : 'rgba(239,68,68,0.3)',
            }}
          >
            <Database className="w-3.5 h-3.5" />
            {status.isConnected ? '接続済み' : '接続エラー'}
          </div>

          <h3 className="text-2xl font-black text-white mb-3 tracking-tight">DB 接続状態</h3>
          <p className="text-stone-400 text-sm leading-relaxed">
            {status.isConnected
              ? 'データベースは正常に動作しています'
              : 'データベースとの接続に問題が発生しています'}
          </p>
        </div>

        {/* メトリクス */}
        <div className="mt-6 space-y-3">
          {/* ステータス */}
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                ステータス
              </span>
              <span className="flex items-center gap-1.5 font-bold"
                style={{ color: status.isConnected ? '#34d399' : '#f87171' }}
              >
                {status.isConnected ? (
                  <><Wifi className="w-3.5 h-3.5" /> Online</>
                ) : (
                  <><WifiOff className="w-3.5 h-3.5" /> Offline</>
                )}
              </span>
            </div>
          </div>

          {/* レイテンシ */}
          {status.latencyMs !== null && (
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  応答時間
                </span>
                <span className={`font-bold ${latencyColor}`}>
                  {status.latencyMs}ms
                </span>
              </div>
              <div className="h-1.5 bg-stone-700/60 rounded-full overflow-hidden">
                <div
                  className="progress-fill h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (status.latencyMs / 50) * 100)}%`,
                    backgroundColor:
                      status.latencyMs < 5
                        ? '#34d399'
                        : status.latencyMs < 20
                          ? '#fbbf24'
                          : '#f87171',
                  }}
                />
              </div>
            </div>
          )}

          {/* DB名 */}
          {status.dbName && (
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-400 mb-1.5">
                <span>データベース</span>
                <span className="text-stone-300 font-mono text-[11px]">{status.dbName}</span>
              </div>
            </div>
          )}

          {/* エラー詳細 */}
          {status.error && (
            <div className="bg-red-900/30 border border-red-800/40 rounded-lg p-3 mt-2">
              <p className="text-red-300 text-xs font-mono leading-relaxed break-all">
                {status.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
