import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { IpBanForm } from './ip-ban-form';
import { UnIpBanButton } from './un-ip-ban-button';
import { ShieldBan, ShieldAlert } from 'lucide-react';
import { OwnerLayout } from '@/components/layout/admin/OwnerLayout';

export default async function IpBansPage() {
  const actor = await getCurrentActor();
  const bans = actor ? await getActiveIpBans(actor) : [];
  const records = actor ? await getIpDeviceRecords(actor) : [];
  const isOwner = actor?.role === 'owner';

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

  return (
    <OwnerLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
              <ShieldBan size={14} />
              <span>Network Security</span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">IP BAN 管理</h1>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldBan size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase">Active Bans</p>
              <p className="text-2xl font-black text-stone-900">{bans.length}件</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-600 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase">Logged IPs</p>
              <p className="text-2xl font-black text-stone-900">{records.length}件</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Action Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-stone-800 mb-4">IP BAN 登録</h2>
              <IpBanForm />
            </div>
          </div>

          {/* Data Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Bans List */}
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-black text-stone-800">有効な IP BAN 一覧</h2>
              </div>
              {bans.length === 0 ? (
                <div className="p-12 text-center text-stone-500 font-medium">
                  有効なIP BANはまだありません。
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-4 px-6">IP Address</th>
                        <th className="py-4 px-6">Reason / Author</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {bans.map((ban) => (
                        <tr key={ban.id} className="hover:bg-stone-50/50 transition-colors group">
                          <td className="py-4 px-6 font-mono font-bold text-red-600">{ban.ip}</td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-stone-800 mb-1">{ban.reason}</div>
                            <div className="text-[10px] text-stone-400">By: {ban.blockedByName ?? `user:${ban.blockedBy}`}</div>
                          </td>
                          <td className="py-4 px-6 text-xs font-medium text-stone-500">
                            {formatDateTimeJst(ban.createdAt).split(' ')[0]}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <UnIpBanButton banId={ban.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Access Records List */}
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-black text-stone-800">アクセス記録一覧</h2>
              </div>
              {records.length === 0 ? (
                <div className="p-12 text-center text-stone-500 font-medium">
                  記録された IP はまだありません。
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">IP Address</th>
                        <th className="py-4 px-6">Activity</th>
                        <th className="py-4 px-6">BAN Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {records.map((record) => (
                        <tr key={record.deviceId} className="hover:bg-stone-50/50 transition-colors group">
                          <td className="py-4 px-6">
                            {record.isBanned ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Banned</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> Safe</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-mono font-bold text-stone-800">{record.ip}</div>
                            <div className="text-[10px] text-stone-400 max-w-[150px] truncate" title={record.browser}>{record.browser}</div>
                          </td>
                          <td className="py-4 px-6 text-xs font-medium text-stone-500">
                            <div className="flex flex-col gap-1">
                              <span><span className="text-stone-400">First:</span> {formatDateTimeJst(record.firstSeenAt).split(' ')[0]}</span>
                              <span><span className="text-stone-400">Last:</span> {formatDateTimeJst(record.lastSeenAt).split(' ')[0]}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs">
                            {record.isBanned ? (
                              <div className="text-red-700 font-medium">
                                <p className="mb-1 leading-tight">{record.banReason}</p>
                                <p className="text-[10px] text-red-500">By: {record.bannedByName ?? `user:${record.bannedBy}`}</p>
                              </div>
                            ) : (
                              <span className="text-stone-300">-</span>
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
        </div>
      </div>
    </OwnerLayout>
  );
}
