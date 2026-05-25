import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { parseListQuery } from '@/types/listQuery';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { IpBanForm } from './ip-ban-form';
import { UnIpBanButton } from './un-ip-ban-button';
import { CopyableCell } from '@/components/ui/CopyableCell';
import Link from 'next/link';
import { ShieldBan, AlertTriangle } from 'lucide-react';

import type { ListQuery, SortOrder } from '@/types/listQuery';

/** prefix 付きクエリパラメータを parseListQuery に通すためのラッパー */
function parsePrefixedQuery<SortKey extends string>(
  raw: { [key: string]: string | string[] | undefined },
  prefix: string,
  otherPrefix: string,
  validSortKeys: SortKey[],
  defaultSortBy: SortKey,
  defaultSortOrder?: SortOrder,
): ListQuery<SortKey> {
  const remapped = Object.fromEntries(
    Object.entries(raw)
      .filter(([k]) => !k.startsWith(otherPrefix))
      .map(([k, v]) => {
        if (k === `${prefix}page`) return ['page', v];
        if (k === `${prefix}sort`) return ['sort', v];
        if (k === `${prefix}order`) return ['order', v];
        if (k === `${prefix}q`) return ['q', v];
        return [k, v] as const;
      }),
  );
  return parseListQuery(remapped as { [key: string]: string | string[] | undefined }, validSortKeys, defaultSortBy, defaultSortOrder);
}

type BanRow = {
  id: number;
  ip: string;
  browser: string;
  reason: string;
  blockedBy: number;
  blockedByName: string | null;
  createdAt: Date;
};

type RecordRow = {
  deviceId: number;
  ip: string;
  browser: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  banId: number | null;
  isBanned: boolean | null;
  banReason: string | null;
  bannedBy: number | null;
  bannedByName: string | null;
  bannedAt: Date | null;
};

export default async function IpBansPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const actor = await getCurrentActor();

  const banQuery = parsePrefixedQuery(searchParams, 'b', 'r', ['createdAt'], 'createdAt', 'desc');
  const recordQuery = parsePrefixedQuery(searchParams, 'r', 'b', ['lastSeenAt'], 'lastSeenAt', 'desc');

  const bansResult = actor ? await getActiveIpBans(actor, banQuery) : { items: [], totalCount: 0 };
  const recordsResult = actor ? await getIpDeviceRecords(actor, recordQuery) : { items: [], totalCount: 0 };
  const bans = bansResult.items as BanRow[];
  const records = recordsResult.items as RecordRow[];
  const bansTotalCount = bansResult.totalCount;
  const recordsTotalCount = recordsResult.totalCount;

  const isOwner = actor?.role === 'owner';

  const banColumns: Column<BanRow>[] = [
    {
      key: 'status',
      label: 'ステータス',
      render: () => (
        <span className="badge badge-red"><span className="badge-dot" style={{ background: '#ef4444' }} />BAN中</span>
      ),
    },
    {
      key: 'ip',
      label: 'IPアドレス',
      render: (_, ban) => (
        <CopyableCell text={ban.ip} mono className="font-bold text-stone-800 text-sm" />
      ),
    },
    {
      key: 'reason',
      label: '理由',
      cellClassName: 'text-sm text-stone-600 max-w-xs truncate',
    },
    {
      key: 'createdAt',
      label: '発行者',
      sortable: true,
      render: (_, ban) => (
        <span className="text-sm text-stone-500">{ban.blockedByName ?? `user:${ban.blockedBy}`}</span>
      ),
    },
    {
      key: 'id',
      label: '操作',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, ban) => <UnIpBanButton banId={ban.id} />,
    },
  ];

  const recordColumns: Column<RecordRow>[] = [
    {
      key: 'isBanned',
      label: 'ステータス',
      render: (_, record) =>
        record.isBanned ? (
          <span className="badge badge-red"><span className="badge-dot" />BAN中</span>
        ) : (
          <span className="badge badge-stone"><span className="badge-dot" />未BAN</span>
        ),
    },
    {
      key: 'ip',
      label: 'IPアドレス',
      render: (_, record) => (
        <CopyableCell text={record.ip} mono className="font-bold text-stone-800 text-sm" />
      ),
    },
    {
      key: 'browser',
      label: 'ブラウザ',
      cellClassName: 'max-w-xs truncate',
      render: (_, record) => (
        <CopyableCell text={record.browser} className="text-xs text-stone-500" />
      ),
    },
    {
      key: 'firstSeenAt',
      label: '初回アクセス',
      cellClassName: 'text-sm text-stone-500',
      render: (v) => formatDateTimeJst(v as Date).split(' ')[0],
    },
    {
      key: 'lastSeenAt',
      label: '最終アクセス',
      sortable: true,
      cellClassName: 'text-sm text-stone-500',
      render: (v) => formatDateTimeJst(v as Date).split(' ')[0],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 text-stone-900">
      {/* ページヘッダー */}
      <div className="animate-float-in">
        <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
            <ShieldBan className="w-16 h-16 text-amber-400/30 ml-6 mt-6" />
          </div>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
              <h1 className="text-3xl font-black text-stone-900 tracking-tight">IP BAN 管理</h1>
            </div>
            <p className="text-stone-500 text-sm pl-4">悪意のあるアクセスをIP単位でブロックします。</p>
          </div>
        </div>
      </div>

      {!isOwner ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          この機能は owner のみ利用できます。
        </div>
      ) : (
        <>
          {/* IP BAN 登録フォーム */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
                <h2 className="text-xl font-black text-stone-800 tracking-tight">IP BAN 登録</h2>
              </div>
              <IpBanForm />
            </div>
          </div>

          {/* IP BAN一覧 */}
          <DataTable
            items={bans}
            query={banQuery}
            totalCount={bansTotalCount}
            columns={banColumns}
            basePath="/owner/ip-bans"
            defaultSortBy="createdAt"
            emptyMessage="有効なIP BANはまだありません。"
            paramPrefix="b"
            hideSearch
          />

          {/* アクセス記録一覧 */}
          <DataTable
            items={records}
            query={recordQuery}
            totalCount={recordsTotalCount}
            columns={recordColumns}
            basePath="/owner/ip-bans"
            defaultSortBy="lastSeenAt"
            emptyMessage="記録された IP はまだありません。"
            searchPlaceholder="IPアドレスを検索..."
            paramPrefix="r"
          />
        </>
      )}

      <div className="pt-8">
        <Link href="/owner" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
          ← オーナー画面に戻る
        </Link>
      </div>
    </div>
  );
}
