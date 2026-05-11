import { BanButton, UnbanButton } from './ban-unban-buttons';
import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getManageableAccounts } from '@/server/services/accountBanService';
import Link from 'next/link';
import { UserX, AlertTriangle } from 'lucide-react';

export default async function AccountBansPage() {
  const actor = await getCurrentActor();
  const accounts = actor ? await getManageableAccounts(actor) : [];
  const isOwner = actor?.role === 'owner';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-stone-900">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
          <UserX className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tighter mb-1">アカウントBAN管理</h1>
          <p className="text-stone-500 font-medium text-sm">システム内のユーザーアカウントのアクセス権限を制御します。</p>
        </div>
      </div>

      {!isOwner ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          この機能は owner のみ利用できます。
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">アカウント一覧</h2>

          {accounts.length === 0 ? (
            <p className="text-stone-500">BAN対象の（または管理可能な）アカウントはありません。</p>
          ) : (
            <div>
              {/* Mobile View: Card List */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {accounts.map((account) => (
                  <div key={account.id} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        {account.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs w-fit"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 有効</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs w-fit"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> BAN済み</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Type</div>
                        <div className="text-xs font-black text-stone-800 uppercase tracking-widest">{account.type}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">UserName</div>
                      <div className="font-bold text-stone-800 text-lg">{account.name}</div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Created At</div>
                      <div className="text-xs font-medium text-stone-500">
                        {formatDateTimeJst(account.createdAt)}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex justify-end">
                      {account.isActive ? (
                        <BanButton userId={account.id} />
                      ) : (
                        <UnbanButton userId={account.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">UserName & Type</th>
                      <th className="pb-3 px-4">Created At</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="py-4 px-4">
                          {account.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 有効</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> BAN済み</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-stone-800 mb-1">{account.name}</div>
                          <div className="text-[10px] text-stone-400 uppercase tracking-widest">{account.type}</div>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-stone-500">
                          {formatDateTimeJst(account.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right">
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
            </div>
          )}
        </div>
      )}

      <div className="pt-8">
        <Link href="/owner" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
          ← オーナー画面に戻る
        </Link>
      </div>
    </div>
  );
}
