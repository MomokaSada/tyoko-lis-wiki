import { BanButton, UnbanButton } from './ban-unban-buttons';
import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getManageableAccounts } from '@/server/services/accountBanService';
import { UserX, ShieldAlert } from 'lucide-react';
import { OwnerLayout } from '@/components/layout/admin/OwnerLayout';

export default async function AccountBansPage() {
  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';
  const accounts = actor ? await getManageableAccounts(actor) : [];

  if (!isOwner) {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            この機能は owner のみ利用できます。
          </div>
        </div>
      </OwnerLayout>
    );
  }

  const bannedCount = accounts.filter(a => !a.isActive).length;

  return (
    <OwnerLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest">
              <UserX size={14} />
              <span>User Security</span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">アカウントBAN管理</h1>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <UserX size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase">Banned Users</p>
              <p className="text-2xl font-black text-stone-900">{bannedCount}名</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase">Active Users</p>
              <p className="text-2xl font-black text-stone-900">{accounts.length - bannedCount}名</p>
            </div>
          </div>
        </div>

        {/* Data Table Panel */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-800">アカウント一覧</h2>
          </div>
          
          {accounts.length === 0 ? (
            <div className="p-12 text-center text-stone-500 font-medium">
              管理可能なアカウントはありません。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">User Details</th>
                    <th className="py-4 px-6">Created At</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        {account.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Banned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-stone-800">{account.name}</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest font-black">{account.type}</div>
                      </td>
                      <td className="py-4 px-6 text-xs font-medium text-stone-500">
                        {formatDateTimeJst(account.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {account.isActive ? (
                          <BanButton userId={account.id} />
                        ) : (
                          <UnbanButton userId={account.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
