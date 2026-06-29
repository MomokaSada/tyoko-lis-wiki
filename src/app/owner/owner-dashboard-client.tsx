'use client';

import { useMemo } from 'react';
import {
  KeySquare,
  Link2,
  ShieldBan,
  UserX,
  ImageMinus,
  AlertTriangle,
  Home,
} from 'lucide-react';
import { DashboardCard } from '@/components/features/admin/DashboardCard';
import { DbStatusCard } from '@/components/features/owner/DbStatusCard';

type DbHealthStatus = {
  isConnected: boolean;
  latencyMs: number | null;
  error: string | null;
  dbName: string | null;
};

type AccountCreateLink = {
  uuid: string;
  authorId: number | null;
  authorName: string | null;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  status: 'active' | 'expired' | 'inactive';
};

type ManageableAccount = {
  id: number;
  name: string;
  type: string;
  createdAt: Date;
  isActive: boolean;
};

type ActiveIpBan = {
  id: number;
  ip: string;
  browser: string;
  reason: string;
  blockedBy: number;
  blockedByName: string | null;
  createdAt: Date;
};

type DeviceSessionUsageRecord = {
  recordId: number | string;
  sessionId: string;
  sessionIsActive: boolean;
  sessionStartAt: Date;
  sessionEndAt: Date;
  sessionAuthorId: number | null;
  sessionAuthorName: string | null;
  editsUsed: number;
  maxEdits: number;
  revisionCount: number;
  ip: string;
  browser: string;
  firstRecordedAt: Date;
  lastRecordedAt: Date;
};

export function OwnerDashboardClient(props: {
  isOwner: boolean;
  dbStatus: DbHealthStatus;
  accountCreateLinks: AccountCreateLink[];
  manageableAccounts: ManageableAccount[];
  activeIpBans: ActiveIpBan[];
  deviceSessionUsageRecords: DeviceSessionUsageRecord[];
  todayUsers: number;
  totalUsers: number;
  editUtilization: number;
  publishRate: number;
}) {
  const {
    isOwner,
    dbStatus,
    accountCreateLinks,
    manageableAccounts,
    activeIpBans,
    deviceSessionUsageRecords,
    todayUsers,
    totalUsers,
    editUtilization,
    publishRate,
  } = props;

  const accountCreateLinksCountText = useMemo(
    () => `${accountCreateLinks.length}件`,
    [accountCreateLinks.length]
  );
  const manageableAccountsCountText = useMemo(
    () => `${manageableAccounts.length}件`,
    [manageableAccounts.length]
  );
  const activeIpBansCountText = useMemo(() => `${activeIpBans.length}件`, [activeIpBans.length]);
  const editUsageCountText = useMemo(
    () => `${deviceSessionUsageRecords.length}件`,
    [deviceSessionUsageRecords.length]
  );

  if (!isOwner) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
        <AlertTriangle className="w-5 h-5" />
        この機能は owner のみ利用できます。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {/* ── System Overview Card (ダークグラデーション) ── */}
      <div className="card-base bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border border-stone-700 rounded-[1.75rem] p-6 overflow-hidden relative lg:col-span-2">
        {/* 光彩 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-stone-700/30 rounded-full blur-2xl pointer-events-none" />

        {/* コンテンツ */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Home className="w-3.5 h-3.5" />
              今日のアクティビティ
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-3 tracking-tight">システム概要</h3>
            <p className="text-stone-400 text-sm leading-relaxed">全ステータスとシステム状態</p>
          </div>

          <div className="mt-6 space-y-3">
            {/* 本日の新規登録 */}
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-400 mb-1.5">
                <span>本日の新規登録</span>
                <span className="text-white font-bold">{todayUsers}件</span>
              </div>
              <div className="h-1.5 bg-stone-700/60 rounded-full overflow-hidden">
                <div
                  className="progress-fill h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalUsers > 0 ? Math.round((todayUsers / totalUsers) * 100) : 0}%` }}
                />
              </div>
            </div>
            {/* 編集利用率 */}
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-400 mb-1.5">
                <span>編集利用率</span>
                <span className="text-white font-bold">{editUtilization}%</span>
              </div>
              <div className="h-1.5 bg-stone-700/60 rounded-full overflow-hidden">
                <div
                  className="progress-fill h-full bg-amber-500 rounded-full"
                  style={{ width: `${editUtilization}%` }}
                />
              </div>
            </div>
            {/* 項目公開率 */}
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-400 mb-1.5">
                <span>項目公開率</span>
                <span className="text-white font-bold">{publishRate}%</span>
              </div>
              <div className="h-1.5 bg-stone-700/60 rounded-full overflow-hidden">
                <div
                  className="progress-fill h-full bg-blue-400 rounded-full"
                  style={{ width: `${publishRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DB 接続状態 ── */}
      <DbStatusCard status={dbStatus} />

      <DashboardCard
        href="/owner/account-create-links"
        icon={<KeySquare className="w-5 h-5" />}
        title="アカウント作成リンク"
        description="登録セッションの発行・失効"
        badgeText={accountCreateLinksCountText}
        theme="blue"
      />
      <DashboardCard
        href="/owner/account-bans"
        icon={<UserX className="w-5 h-5" />}
        title="アカウントBAN"
        description="強制ログアウト・再ログイン抑止"
        badgeText={manageableAccountsCountText}
        theme="red"
      />
      <DashboardCard
        href="/owner/ip-bans"
        icon={<ShieldBan className="w-5 h-5" />}
        title="IP BAN"
        description="悪意あるアクセス元の遮断"
        badgeText={activeIpBansCountText}
        theme="amber"
      />
      <DashboardCard
        href="/owner/edit-link-usage"
        icon={<Link2 className="w-5 h-5" />}
        title="編集リンク使用状況"
        description="デバイス別の使用記録の確認"
        badgeText={editUsageCountText}
        theme="emerald"
      />
      <DashboardCard
        href="/owner/thumbnail-cleanup"
        icon={<ImageMinus className="w-5 h-5" />}
        title="サムネイルクリーンアップ"
        description="未使用サムネイルの削除"
        theme="stone"
      />
    </div>
  );
}
