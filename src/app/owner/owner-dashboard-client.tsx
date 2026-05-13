'use client';

import { useMemo } from 'react';
import {
  KeySquare,
  Link2,
  ShieldBan,
  UserX,
  ImageMinus,
  AlertTriangle,
} from 'lucide-react';
import { DashboardCard } from '@/components/ui/DashboardCard';

type AccountCreateLink = {
  uuid: string;
  authorId: number;
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
  sessionAuthorId: number;
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
  accountCreateLinks: AccountCreateLink[];
  manageableAccounts: ManageableAccount[];
  activeIpBans: ActiveIpBan[];
  deviceSessionUsageRecords: DeviceSessionUsageRecord[];
}) {
  const {
    isOwner,
    accountCreateLinks,
    manageableAccounts,
    activeIpBans,
    deviceSessionUsageRecords,
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
