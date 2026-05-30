import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { parseListQuery } from '@/types/listQuery';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { IpBanForm } from './ip-ban-form';
import { UnIpBanButton } from './un-ip-ban-button';
import { DetailModal } from './reason-detail';
import { IpBansTabs } from './ip-bans-tabs';
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
    // 1. メイン情報 / IPアドレス（左寄せ）
    {
      key: 'ip',
      label: 'IPアドレス',
      headerAlign: 'left',
      cellAlign: 'left',
      render: (_, ban) => (
        <CopyableCell text={ban.ip} mono />
      ),
    },
    // 3. 日時・発行者（中央寄せ）
    {
      key: 'createdAt',
      label: '発行者',
      sortable: true,
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, ban) => (
        <span className="text-sm text-stone-500">{ban.blockedByName ?? `user:${ban.blockedBy}`}</span>
      ),
    },
    // 4. ステータス（中央寄せ）
    {
      key: 'status',
      label: 'ステータス',
      headerAlign: 'center',
      cellAlign: 'center',
      render: () => (
        <span className="badge badge-red"><span className="badge-dot" style={{ background: '#ef4444' }} />BAN中</span>
      ),
    },
    // 6. アクション（中央寄せ）
    {
      key: 'id',
      label: '操作',
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, ban) => <UnIpBanButton banId={ban.id} />,
    },
    // 7. 詳細（中央寄せ）— 理由は詳細ボタンでモーダル表示
    {
      key: 'reason',
      label: '理由',
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, ban) => <DetailModal title="BAN理由" content={ban.reason} />,
    },
  ];

  const recordColumns: Column<RecordRow>[] = [
    // 1. メイン情報 / IPアドレス（左寄せ）
    {
      key: 'ip',
      label: 'IPアドレス',
      headerAlign: 'left',
      cellAlign: 'left',
      render: (_, record) => (
        <CopyableCell text={record.ip} mono />
      ),
    },
    // 2. ブラウザ情報（中央寄せ）— 詳細ボタンでモーダル表示
    {
      key: 'browser',
      label: 'ブラウザ',
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, record) => <DetailModal title="ブラウザ情報" content={record.browser} />,
    },
    // 3. 日時（中央寄せ）
    {
      key: 'firstSeenAt',
      label: '初回アクセス',
      headerAlign: 'center',
      cellAlign: 'center',
      cellClassName: 'text-sm text-stone-500',
      render: (v) => formatDateTimeJst(v as Date).split(' ')[0],
    },
    // 3. 日時（中央寄せ）— sortable
    {
      key: 'lastSeenAt',
      label: '最終アクセス',
      sortable: true,
      headerAlign: 'center',
      cellAlign: 'center',
      cellClassName: 'text-sm text-stone-500',
      render: (v) => formatDateTimeJst(v as Date).split(' ')[0],
    },
    // 4. ステータス（中央寄せ）
    {
      key: 'isBanned',
      label: 'ステータス',
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, record) =>
        record.isBanned ? (
          <span className="badge badge-red"><span className="badge-dot" />BAN中</span>
        ) : (
          <span className="badge badge-stone"><span className="badge-dot" />未BAN</span>
        ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8 text-stone-900">
      {/* ページヘッダー */}
      <div className="animate-float-in">
        <div className="relative bg-white border border-stone-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 overflow-hidden shadow-sm">
          <div className="absolute -top-12 sm:-top-12 -left-12 sm:-left-12 w-28 sm:w-36 h-28 sm:h-36 bg-amber-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
            <ShieldBan className="w-14 sm:w-16 h-14 sm:h-16 text-amber-400/30 ml-5 sm:ml-6 mt-5 sm:mt-6" />
          </div>
          <div className="absolute -right-8 sm:-right-10 -bottom-8 sm:-bottom-10 w-24 sm:w-28 h-24 sm:h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-1 sm:w-1.5 h-6 sm:h-7 bg-amber-500 rounded-full shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">IP BAN 管理</h1>
            </div>
            <p className="text-stone-500 text-sm pl-3 sm:pl-4">悪意のあるアクセスをIP単位でブロックします。</p>
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
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-1 sm:w-1.5 h-6 sm:h-7 bg-amber-500 rounded-full shrink-0" />
                <h2 className="text-lg sm:text-xl font-black text-stone-800 tracking-tight">IP BAN 登録</h2>
              </div>
              <IpBanForm />
            </div>
          </div>

          {/* タブでテーブルを切り替え */}
          <IpBansTabs
            defaultTab={Object.keys(searchParams).some(k => k.startsWith('r')) && !Object.keys(searchParams).some(k => k.startsWith('b')) ? 'records' : 'bans'}
            bansTable={
              <DataTable
                items={bans}
                query={banQuery}
                totalCount={bansTotalCount}
                columns={banColumns}
                basePath="/owner/ip-bans"
                defaultSortBy="createdAt"
                emptyMessage="有効なIP BANはまだありません。"
                searchPlaceholder="IPアドレスを検索..."
                paramPrefix="b"
              />
            }
            recordsTable={
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
            }
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
