import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getDeviceSessionUsageRecords } from '@/server/services/deviceService';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { parseListQuery } from '@/types/listQuery';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import Link from 'next/link';
import { Link2, AlertTriangle, Eye } from 'lucide-react';

type UsageRecord = {
  recordId: number | string;
  sessionId: string;
  sessionIsActive: boolean;
  sessionAuthorId: number;
  sessionAuthorName: string | null;
  sessionEndAt: Date;
  lastRecordedAt: Date;
  ip: string;
  editsUsed: number;
  maxEdits: number;
  revisionCount: number;
};

function getStatusBadge(record: UsageRecord) {
  if (!record.sessionIsActive) {
    return <span className="badge badge-stone"><span className="badge-dot" />無効化済み</span>;
  }
  if (record.editsUsed >= record.maxEdits) {
    return <span className="badge badge-amber"><span className="badge-dot" />上限到達</span>;
  }
  if (record.sessionEndAt <= new Date()) {
    return <span className="badge badge-red"><span className="badge-dot" />期限切れ</span>;
  }
  return <span className="badge badge-emerald"><span className="badge-dot" />有効</span>;
}

export default async function EditLinkUsagePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const actor = await getCurrentActor();
  const query = parseListQuery(searchParams, ['updatedAt', 'editsUsed'], 'updatedAt');
  const recordsResult = actor ? await getDeviceSessionUsageRecords(actor, query) : { items: [], totalCount: 0 };
  const records = recordsResult.items as UsageRecord[];
  const totalCount = recordsResult.totalCount;
  const isOwner = actor?.role === 'owner';

  const columns: Column<UsageRecord>[] = [
    // 1. メイン情報（左寄せ）
    {
      key: 'sessionId',
      label: 'セッションID / 作成者',
      headerAlign: 'left',
      cellAlign: 'left',
      render: (_, record) => (
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-mono text-stone-600 truncate max-w-[8rem] sm:max-w-[12rem]">{record.sessionId}</p>
          <p className="text-xs text-stone-400 truncate max-w-[10rem] sm:max-w-none">
            {record.sessionAuthorName ?? `user:${record.sessionAuthorId}`} | IP: {record.ip}
          </p>
        </div>
      ),
    },
    // 3. 横幅が予測できる要素（中央寄せ）
    {
      key: 'editsUsed',
      label: '使用回数',
      sortable: true,
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, record) => (
        <span className="text-sm font-bold text-stone-800 tabular-nums">
          {record.editsUsed} / {record.maxEdits}
          <span className="text-xs font-medium text-stone-500 ml-1">回</span>
        </span>
      ),
    },
    {
      key: 'revisionCount',
      label: 'Rev',
      headerAlign: 'center',
      cellAlign: 'center',
      render: (v) => <span className="text-xs text-stone-500">{(v as number) ?? 0}</span>,
    },
    // 3. 日時（中央寄せ、sortable）
    {
      key: 'lastRecordedAt',
      label: '最終アクセス',
      sortable: true,
      headerAlign: 'center',
      cellAlign: 'center',
      render: (v) => <span className="text-sm text-stone-500">{formatDateTimeJst(v as Date).split(' ')[0]}</span>,
    },
    // 4. ステータス（中央寄せ）
    {
      key: 'status',
      label: 'ステータス',
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, record) => getStatusBadge(record),
    },
    // 5. 詳細 / アクション（中央寄せ）
    {
      key: 'recordId',
      label: '',
      headerAlign: 'center',
      cellAlign: 'center',
      render: (_, record) => (
        <Link
          href={`/owner/edit-link-usage/detail?id=${record.recordId}`}
          className="btn-ghost btn-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="ml-1">詳細</span>
        </Link>
      ),
    },
  ];

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8 text-stone-900">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 sm:-top-12 -left-12 sm:-left-12 w-28 sm:w-36 h-28 sm:h-36 bg-emerald-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <Link2 className="w-14 sm:w-16 h-14 sm:h-16 text-emerald-400/30 ml-5 sm:ml-6 mt-5 sm:mt-6" />
            </div>
            <div className="absolute -right-8 sm:-right-10 -bottom-8 sm:-bottom-10 w-24 sm:w-28 h-24 sm:h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-1 sm:w-1.5 h-6 sm:h-7 bg-emerald-500 rounded-full shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">編集リンク使用状況</h1>
              </div>
              <p className="text-stone-500 text-sm pl-3 sm:pl-4">各デバイスでのセッション使用状況や監査ログの確認を行います。</p>
            </div>
          </div>
        </div>

        {!isOwner ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            この機能は owner のみ利用できます。
          </div>
        ) : (
          <DataTable
            items={records}
            query={query}
            totalCount={totalCount}
            columns={columns}
            basePath="/owner/edit-link-usage"
            defaultSortBy="updatedAt"
            emptyMessage="編集リンクの使用記録はまだありません。"
            searchPlaceholder="セッションID を検索..."
          />
        )}

        <div className="pt-8">
          <Link href="/owner" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
            ← オーナー画面に戻る
          </Link>
        </div>
      </div>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
