'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  KeySquare,
  Link2,
  ShieldBan,
  UserX,
  ImageMinus,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { AccountCreateLinkForm } from './account-create-links/account-create-link-form';
import { InvalidButton } from './account-create-links/invalid-button';
import { BanButton, UnbanButton } from './account-bans/ban-unban-buttons';
import { IpBanForm } from './ip-bans/ip-ban-form';
import { UnIpBanButton } from './ip-bans/un-ip-ban-button';
import { OrphanThumbnailCleanupForm } from './orphan-thumbnail-cleanup-form';

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

type IpDeviceRecord = {
  deviceId: number | string;
  ip: string;
  browser: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  isBanned: boolean | null;
  banReason: string | null;
  bannedBy: number | null;
  bannedByName: string | null;
  bannedAt: Date | null;
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

function getSessionStatusBadge(record: {
  sessionIsActive: boolean;
  sessionEndAt: Date;
  editsUsed: number;
  maxEdits: number;
}) {
  if (!record.sessionIsActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-stone-400" /> 無効化済み
      </span>
    );
  }
  if (record.editsUsed >= record.maxEdits) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 上限到達
      </span>
    );
  }
  if (record.sessionEndAt <= new Date()) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> 期限切れ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 有効
    </span>
  );
}

type OpenSection =
  | 'account-create-links'
  | 'account-bans'
  | 'ip-bans'
  | 'edit-link-usage'
  | 'thumbnail-cleanup'
  | null;

function EditLinkUsageCard({ record }: { record: DeviceSessionUsageRecord }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
                  <div className="mb-2">{getSessionStatusBadge(record)}</div>
            <div className="font-mono text-xs text-stone-700 truncate" title={record.sessionId}>
              {record.sessionId}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] text-stone-400 font-bold">使用</div>
            <div className="text-sm font-black text-stone-800">
              {record.editsUsed}/{record.maxEdits}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
            <div className="text-[10px] text-stone-400 font-bold mb-1">IP</div>
            <div className="font-mono font-bold text-stone-700 truncate" title={record.ip}>
              {record.ip}
            </div>
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
            <div className="text-[10px] text-stone-400 font-bold mb-1">改訂</div>
            <div className="font-bold text-stone-700">{record.revisionCount}</div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-600 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <div className="text-[10px] text-stone-400 font-bold mb-1">作成者</div>
            <div className="font-medium">
              {record.sessionAuthorName ?? `user:${record.sessionAuthorId}`}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
              <div className="text-[10px] text-stone-400 font-bold mb-1">Start</div>
              <div className="font-bold text-stone-700">
                {formatDateTimeJst(record.sessionStartAt).split(' ')[0]}
              </div>
            </div>
            <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
              <div className="text-[10px] text-stone-400 font-bold mb-1">End</div>
              <div className="font-bold text-stone-700">
                {formatDateTimeJst(record.sessionEndAt).split(' ')[0]}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-stone-400 font-bold mb-1">ブラウザ</div>
            <div className="text-[11px] text-stone-500 break-words">{record.browser}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
              <div className="text-[10px] text-stone-400 font-bold mb-1">First</div>
              <div className="font-bold text-stone-700">
                {formatDateTimeJst(record.firstRecordedAt).split(' ')[0]}
              </div>
            </div>
            <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
              <div className="text-[10px] text-stone-400 font-bold mb-1">Last</div>
              <div className="font-bold text-stone-700">
                {formatDateTimeJst(record.lastRecordedAt).split(' ')[0]}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OwnerDashboardClient(props: {
  isOwner: boolean;
  accountCreateLinks: AccountCreateLink[];
  manageableAccounts: ManageableAccount[];
  activeIpBans: ActiveIpBan[];
  ipDeviceRecords: IpDeviceRecord[];
  deviceSessionUsageRecords: DeviceSessionUsageRecord[];
}) {
  const {
    isOwner,
    accountCreateLinks,
    manageableAccounts,
    activeIpBans,
    ipDeviceRecords,
    deviceSessionUsageRecords,
  } = props;

  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const sectionRefs = {
    'account-create-links': useRef<HTMLDivElement | null>(null),
    'account-bans': useRef<HTMLDivElement | null>(null),
    'ip-bans': useRef<HTMLDivElement | null>(null),
    'edit-link-usage': useRef<HTMLDivElement | null>(null),
    'thumbnail-cleanup': useRef<HTMLDivElement | null>(null),
  } as const;

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

  function toggleAndScrollTo(section: Exclude<OpenSection, null>) {
    const isOpen = openSection === section;
    const next: OpenSection = isOpen ? null : section;
    setOpenSection(next);

    if (!next) return;
    requestAnimationFrame(() =>
      sectionRefs[next].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  }

  function getLinkStatusBadge(status: 'active' | 'expired' | 'inactive') {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 有効
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> 期限切れ
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400" /> 無効化済み
          </span>
        );
    }
  }

 

  function DashboardCard({
    section,
    icon,
    title,
    description,
    badgeText,
    theme,
  }: {
    section: Exclude<OpenSection, null>;
    icon: React.ReactNode;
    title: string;
    description: string;
    badgeText?: string;
    theme: 'blue' | 'red' | 'amber' | 'emerald' | 'stone';
  }) {
    const themeMap = {
      blue: 'bg-blue-100 text-blue-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      stone: 'bg-stone-100 text-stone-700',
    } as const;

    const isOpen = openSection === section;

    return (
      <button
        type="button"
        onClick={() => toggleAndScrollTo(section)}
        className="text-left bg-white border border-stone-200 rounded-3xl p-5 hover:shadow-lg transition-all group relative overflow-hidden min-h-[148px]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${themeMap[theme]}`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-stone-800 leading-tight">{title}</h3>
              <p className="text-xs text-stone-500 font-medium mt-1">{description}</p>
            </div>
          </div>
          {badgeText ? (
            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
              {badgeText}
            </span>
          ) : null}
        </div>
        <div className="mt-4 w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-stone-800 transition-colors">
          <ArrowDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          {isOpen ? '閉じる' : '開く'}
        </div>
      </button>
    );
  }

  if (!isOwner) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
        <AlertTriangle className="w-5 h-5" />
        この機能は owner のみ利用できます。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <DashboardCard
          section="account-create-links"
          icon={<KeySquare className="w-5 h-5" />}
          title="アカウント作成リンク"
          description="登録セッションの発行・失効"
          badgeText={accountCreateLinksCountText}
          theme="blue"
        />
        <DashboardCard
          section="account-bans"
          icon={<UserX className="w-5 h-5" />}
          title="アカウントBAN"
          description="強制ログアウト・再ログイン抑止"
          badgeText={manageableAccountsCountText}
          theme="red"
        />
        <DashboardCard
          section="ip-bans"
          icon={<ShieldBan className="w-5 h-5" />}
          title="IP BAN"
          description="悪意あるアクセス元の遮断"
          badgeText={activeIpBansCountText}
          theme="amber"
        />
        <DashboardCard
          section="edit-link-usage"
          icon={<Link2 className="w-5 h-5" />}
          title="編集リンク使用状況"
          description="デバイス別の使用記録の確認"
          badgeText={editUsageCountText}
          theme="emerald"
        />
        <DashboardCard
          section="thumbnail-cleanup"
          icon={<ImageMinus className="w-5 h-5" />}
          title="サムネイルクリーンアップ"
          description="未使用サムネイルの削除"
          theme="stone"
        />
      </div>

      {openSection === 'account-create-links' && (
        <div
          ref={sectionRefs['account-create-links']}
          className="space-y-4 scroll-mt-24 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h3 className="font-bold text-stone-800 mb-2">アカウント作成リンク生成</h3>
            <p className="text-sm text-stone-500 mb-4">新規ユーザーの登録セッションを発行します。</p>
            <AccountCreateLinkForm />
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h4 className="font-bold text-stone-800 mb-4">発行済みリンク一覧</h4>
            {accountCreateLinks.length === 0 ? (
              <p className="text-stone-500 text-center py-4">まだ発行されたリンクはありません。</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {accountCreateLinks.map((link) => (
                  <div
                    key={link.uuid}
                    className="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-stone-700 truncate" title={link.uuid}>
                          {link.uuid}
                        </div>
                        <div className="mt-2">{getLinkStatusBadge(link.status)}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        {link.status === 'active' ? <InvalidButton uuid={link.uuid} /> : null}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[10px] text-blue-600 font-bold mb-1">URL</div>
                      <a
                        className="block text-[11px] text-blue-600 hover:underline truncate break-all"
                        href={`${process.env.NEXT_PUBLIC_APP_URL}/auth/register?session=${link.uuid}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`${process.env.NEXT_PUBLIC_APP_URL}/auth/register?session=${link.uuid}`}
                      >
                        {`${process.env.NEXT_PUBLIC_APP_URL}/auth/register?session=${link.uuid}`}
                      </a>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">開始</div>
                        <div className="font-bold text-stone-700">
                          {formatDateTimeJst(link.startAt).split(' ')[0]}
                        </div>
                      </div>
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">終了</div>
                        <div className="font-bold text-stone-700">
                          {formatDateTimeJst(link.endAt).split(' ')[0]}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-stone-500 font-medium truncate">
                      作成者: {link.authorName ?? `user:${link.authorId}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {openSection === 'account-bans' && (
        <div
          ref={sectionRefs['account-bans']}
          className="space-y-4 scroll-mt-24 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h4 className="font-bold text-stone-800 mb-4">アカウント一覧</h4>
            {manageableAccounts.length === 0 ? (
              <p className="text-stone-500 text-center py-4">
                BAN対象の（または管理可能な）アカウントはありません。
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {manageableAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-stone-800 truncate">{account.name}</div>
                        <div className="mt-1 text-[10px] text-stone-400 uppercase tracking-widest truncate">
                          {account.type}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {account.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 有効
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> BAN済み
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">作成日</div>
                        <div className="font-bold text-stone-700">
                          {formatDateTimeJst(account.createdAt).split(' ')[0]}
                        </div>
                      </div>
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">操作</div>
                        <div className="flex justify-end">
                          {account.isActive ? (
                            <BanButton userId={account.id} />
                          ) : (
                            <UnbanButton userId={account.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {openSection === 'ip-bans' && (
        <div
          ref={sectionRefs['ip-bans']}
          className="space-y-4 scroll-mt-24 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h3 className="font-bold text-stone-800 mb-2">IP BAN 登録</h3>
            <p className="text-sm text-stone-500 mb-4">悪意あるアクセスをIP単位でブロックします。</p>
            <IpBanForm />
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h4 className="font-bold text-stone-800 mb-4">有効な IP BAN 一覧</h4>
            {activeIpBans.length === 0 ? (
              <p className="text-stone-500 text-center py-4">有効なIP BANはまだありません。</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {activeIpBans.map((ban) => (
                  <div
                    key={ban.id}
                    className="rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono font-black text-red-600 truncate" title={ban.ip}>
                          {ban.ip}
                        </div>
                        <div className="mt-2 text-sm font-medium text-stone-800 line-clamp-2">
                          {ban.reason}
                        </div>
                        <div className="mt-2 text-[10px] text-stone-400 truncate" title={ban.browser}>
                          {ban.browser}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <UnIpBanButton banId={ban.id} />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">作成日</div>
                        <div className="font-bold text-stone-700">
                          {formatDateTimeJst(ban.createdAt).split(' ')[0]}
                        </div>
                      </div>
                      <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                        <div className="text-[10px] text-stone-400 font-bold mb-1">作成者</div>
                        <div className="font-bold text-stone-700 truncate">
                          {ban.blockedByName ?? `user:${ban.blockedBy}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h4 className="font-bold text-stone-800 mb-4">アクセス記録一覧</h4>
            {ipDeviceRecords.length === 0 ? (
              <p className="text-stone-500 text-center py-4">記録された IP はまだありません。</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {ipDeviceRecords.map((record) => (
                  <details
                    key={record.deviceId}
                    className="group rounded-2xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow open:shadow-sm"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {record.isBanned ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> BAN中
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-stone-400" /> 未BAN
                              </span>
                            )}
                            <span className="font-mono font-black text-stone-800 truncate" title={record.ip}>
                              {record.ip}
                            </span>
                          </div>
                          <div className="mt-2 text-[10px] text-stone-400 truncate" title={record.browser}>
                            {record.browser}
                          </div>
                        </div>
                        <div className="shrink-0 text-xs font-bold text-stone-500">
                          詳細
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                          <div className="text-[10px] text-stone-400 font-bold mb-1">初回</div>
                          <div className="font-bold text-stone-700">
                            {formatDateTimeJst(record.firstSeenAt).split(' ')[0]}
                          </div>
                        </div>
                        <div className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-2">
                          <div className="text-[10px] text-stone-400 font-bold mb-1">最終</div>
                          <div className="font-bold text-stone-700">
                            {formatDateTimeJst(record.lastSeenAt).split(' ')[0]}
                          </div>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-3 border-t border-stone-100 pt-3 text-xs">
                      {record.isBanned ? (
                        <div className="text-red-700 font-medium">
                          <div className="text-[10px] text-stone-400 font-bold mb-1">BAN情報</div>
                          <p className="mb-1">{record.banReason}</p>
                          <p className="text-[10px] text-red-500">
                            By: {record.bannedByName ?? `user:${record.bannedBy}`}{' '}
                            {record.bannedAt
                              ? `(${formatDateTimeJst(record.bannedAt).split(' ')[0]})`
                              : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="text-stone-500">
                          <div className="text-[10px] text-stone-400 font-bold mb-1">BAN情報</div>
                          <p>未BAN</p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {openSection === 'edit-link-usage' && (
        <div
          ref={sectionRefs['edit-link-usage']}
          className="space-y-4 scroll-mt-24 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h4 className="font-bold text-stone-800 mb-4">使用記録一覧</h4>
            {deviceSessionUsageRecords.length === 0 ? (
              <p className="text-stone-500 text-center py-4">編集リンクの使用記録はまだありません。</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {deviceSessionUsageRecords.map((record) => (
                  <EditLinkUsageCard key={record.recordId} record={record} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {openSection === 'thumbnail-cleanup' && (
        <div
          ref={sectionRefs['thumbnail-cleanup']}
          className="space-y-4 scroll-mt-24 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h4 className="font-bold text-stone-800 mb-2">サムネイルクリーンアップ</h4>
            <p className="text-sm text-stone-500 mb-4">参照されていないサムネイルを削除します。</p>
            <OrphanThumbnailCleanupForm />
          </div>
        </div>
      )}
    </div>
  );
}

