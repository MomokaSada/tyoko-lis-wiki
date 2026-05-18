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
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-top-2 duration-300">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span>この機能は owner のみ利用できます。アクセス権限を確認してください。</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardCard
        href="/owner/account-create-links"
        icon={<KeySquare />}
        title="アカウント作成リンク"
        description="新しいアカウント登録用セッションの発行と失効を管理します。"
        badgeText={accountCreateLinksCountText}
        theme="blue"
      />
      <DashboardCard
        href="/owner/account-bans"
        icon={<UserX />}
        title="アカウントBAN"
        description="ユーザーの強制ログアウトおよび再ログインの禁止を執行します。"
        badgeText={manageableAccountsCountText}
        theme="red"
      />
      <DashboardCard
        href="/owner/ip-bans"
        icon={<ShieldBan />}
        title="IP BAN"
        description="悪意のあるアクセス元IPアドレスを遮断し、システムを保護します。"
        badgeText={activeIpBansCountText}
        theme="amber"
      />
      <DashboardCard
        href="/owner/edit-link-usage"
        icon={<Link2 />}
        title="編集リンク使用状況"
        description="発行された編集リンクがどのデバイスでどのように使われたかを確認します。"
        badgeText={editUsageCountText}
        theme="emerald"
      />
      <DashboardCard
        href="/owner/thumbnail-cleanup"
        icon={<ImageMinus />}
        title="サムネイルクリーンアップ"
        description="どの記事からも参照されていない未使用のサムネイル画像を削除します。"
        theme="stone"
      />
    </div>
  );
}
