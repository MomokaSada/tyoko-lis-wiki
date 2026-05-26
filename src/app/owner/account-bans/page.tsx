import { BanButton, UnbanButton } from './ban-unban-buttons';
import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getManageableAccounts } from '@/server/services/accountBanService';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { parseListQuery } from '@/types/listQuery';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import Link from 'next/link';
import { UserX, AlertTriangle } from 'lucide-react';

function getAvatarStyle(name: string) {
  const colors = ['avatar-amber', 'avatar-emerald', 'avatar-blue', 'avatar-purple', 'avatar-stone'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
}

type ManageableAccount = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
};

export default async function AccountBansPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';
  const query = parseListQuery(searchParams, ['name', 'createdAt', 'isActive'], 'name', 'asc');
  const accountsResult = actor ? await getManageableAccounts(actor, query) : { items: [], totalCount: 0 };
  const accounts = accountsResult.items as ManageableAccount[];
  const totalCount = accountsResult.totalCount;

  const columns: Column<ManageableAccount>[] = [
    {
      key: 'name',
      label: 'アカウント',
      sortable: true,
      render: (_, account) => {
        const initial = account.name.charAt(0).toUpperCase() + (account.name.charAt(1) || '').toLowerCase();
        const avatarColor = getAvatarStyle(account.name);
        return (
          <div className="flex items-center gap-3">
            <div className={`avatar ${avatarColor}`}>{initial}</div>
            <span className="font-bold text-stone-800">{account.name}</span>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      label: 'ステータス',
      sortable: true,
      render: (_, account) =>
        account.isActive ? (
          <span className="badge badge-stone"><span className="badge-dot" />アクティブ</span>
        ) : (
          <span className="badge badge-red"><span className="badge-dot" />BAN中</span>
        ),
    },
    {
      key: 'createdAt',
      label: '登録日',
      sortable: true,
      cellClassName: 'text-sm text-stone-500',
      render: (v) => formatDateTimeJst(v as Date).split(' ')[0],
    },
    {
      key: 'id',
      label: '操作',
      render: (_, account) => (
        <div className="flex gap-1">
          {account.isActive ? <BanButton userId={account.id} /> : <UnbanButton userId={account.id} />}
        </div>
      ),
    },
  ];

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 text-stone-900">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-red-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <UserX className="w-16 h-16 text-red-400/30 ml-6 mt-6" />
            </div>
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-7 bg-red-600 rounded-full" />
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">アカウントBAN管理</h1>
              </div>
              <p className="text-stone-500 text-sm pl-4">強制ログアウト・再ログイン抑止中のアカウント</p>
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
              items={accounts}
              query={query}
              totalCount={totalCount}
              columns={columns}
              basePath="/owner/account-bans"
              defaultSortBy="name"
              defaultSortOrder="asc"
              emptyMessage="BAN対象の（または管理可能な）アカウントはありません。"
              searchPlaceholder="アカウントを検索..."
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
