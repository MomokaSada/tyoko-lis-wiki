'use client';

import { useState } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

export function IpBansTabs({
  bansTable,
  recordsTable,
  defaultTab = 'bans',
}: {
  bansTable: React.ReactNode;
  recordsTable: React.ReactNode;
  defaultTab?: 'bans' | 'records';
}) {
  const [activeTab, setActiveTab] = useState<'bans' | 'records'>(defaultTab);

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('bans')}
          className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'bans'
              ? 'border-amber-500 text-amber-600 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300 hover:bg-stone-50 rounded-t-xl'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          BAN済みIP一覧
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'records'
              ? 'border-amber-500 text-amber-600 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300 hover:bg-stone-50 rounded-t-xl'
          }`}
        >
          <Activity className="w-4 h-4" />
          アクセス記録
        </button>
      </div>

      {/* タブコンテンツ */}
      <div>
        <div className={activeTab === 'bans' ? 'block animate-float-in' : 'hidden'}>
          {bansTable}
        </div>
        <div className={activeTab === 'records' ? 'block animate-float-in' : 'hidden'}>
          {recordsTable}
        </div>
      </div>
    </div>
  );
}
