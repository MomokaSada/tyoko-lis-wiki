import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { IpBanForm } from './ip-ban-form';
import { UnIpBanButton } from './un-ip-ban-button';
import Link from 'next/link';
import { ShieldBan, AlertTriangle } from 'lucide-react';

export default async function IpBansPage() {
  const actor = await getCurrentActor();
  const bans = actor ? await getActiveIpBans(actor) : [];
  const records = actor ? await getIpDeviceRecords(actor) : [];
  const isOwner = actor?.role === 'owner';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-stone-900">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldBan className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tighter mb-1">IP BAN 管理</h1>
          <p className="text-stone-500 font-medium text-sm">悪意のあるアクセスをIP単位でブロックします。</p>
        </div>
      </div>

      {!isOwner ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          この機能は owner のみ利用できます。
        </div>
      ) : (
        <>
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">IP BAN 登録</h2>
            <IpBanForm />
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">有効な IP BAN 一覧</h2>
            {bans.length === 0 ? (
              <p className="text-stone-500">有効なIP BANはまだありません。</p>
            ) : (
              <div>
                {/* Mobile View: Card List */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {bans.map((ban) => (
                    <div key={ban.id} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="font-mono font-bold text-red-600 break-all">{ban.ip}</div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{formatDateTimeJst(ban.createdAt).split(' ')[0]}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Reason</div>
                        <div className="font-medium text-stone-700">{ban.reason}</div>
                        <div className="text-[10px] text-stone-400">By: {ban.blockedByName ?? `user:${ban.blockedBy}`}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Browser</div>
                        <div className="text-xs text-stone-500 line-clamp-2">{ban.browser}</div>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex justify-end">
                        <UnIpBanButton banId={ban.id} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3 px-4">IP Address</th>
                        <th className="pb-3 px-4">Browser Info</th>
                        <th className="pb-3 px-4">Reason / Author</th>
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {bans.map((ban) => (
                        <tr key={ban.id} className="hover:bg-stone-50 transition-colors group">
                          <td className="py-4 px-4 font-mono font-bold text-red-600">{ban.ip}</td>
                          <td className="py-4 px-4 text-xs text-stone-500 max-w-[200px] truncate">{ban.browser}</td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-stone-700 mb-1">{ban.reason}</div>
                            <div className="text-[10px] text-stone-400">By: {ban.blockedByName ?? `user:${ban.blockedBy}`}</div>
                          </td>
                          <td className="py-4 px-4 text-xs text-stone-500">{formatDateTimeJst(ban.createdAt).split(' ')[0]}</td>
                          <td className="py-4 px-4 text-right">
                            <UnIpBanButton banId={ban.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">アクセス記録一覧</h2>
            {records.length === 0 ? (
              <p className="text-stone-500">記録された IP はまだありません。</p>
            ) : (
              <div>
                {/* Mobile View: Card List */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {records.map((record) => (
                    <div key={record.deviceId} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        {record.isBanned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> BAN中</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> 未BAN</span>
                        )}
                        <div className="font-mono text-stone-800 font-bold text-sm">{record.ip}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="text-xs">
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">First Seen</div>
                          <div className="font-medium text-stone-500">{formatDateTimeJst(record.firstSeenAt).split(' ')[0]}</div>
                        </div>
                        <div className="text-xs">
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Last Seen</div>
                          <div className="font-medium text-stone-500">{formatDateTimeJst(record.lastSeenAt).split(' ')[0]}</div>
                        </div>
                      </div>

                      {record.isBanned && (
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 space-y-1">
                          <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">BAN Reason</div>
                          <p className="text-xs text-red-700 font-medium">{record.banReason}</p>
                          <p className="text-[10px] text-red-500">By: {record.bannedByName ?? `user:${record.bannedBy}`} {record.bannedAt ? `(${formatDateTimeJst(record.bannedAt).split(' ')[0]})` : ''}</p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Browser</div>
                        <div className="text-xs text-stone-500 line-clamp-1">{record.browser}</div>
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
                        <th className="pb-3 px-4">IP Address</th>
                        <th className="pb-3 px-4">Activity Date</th>
                        <th className="pb-3 px-4">BAN Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {records.map((record) => (
                        <tr key={record.deviceId} className="hover:bg-stone-50 transition-colors group">
                          <td className="py-4 px-4">
                            {record.isBanned ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> BAN中</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> 未BAN</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-mono text-stone-800 font-bold mb-1">{record.ip}</div>
                            <div className="text-[10px] text-stone-400 max-w-[200px] truncate" title={record.browser}>{record.browser}</div>
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-stone-500">
                            <div><span className="text-stone-400">初回:</span> {formatDateTimeJst(record.firstSeenAt).split(' ')[0]}</div>
                            <div><span className="text-stone-400">最終:</span> {formatDateTimeJst(record.lastSeenAt).split(' ')[0]}</div>
                          </td>
                          <td className="py-4 px-4 text-xs">
                            {record.isBanned ? (
                              <div className="text-red-700 font-medium">
                                <p className="mb-1">{record.banReason}</p>
                                <p className="text-[10px] text-red-500">By: {record.bannedByName ?? `user:${record.bannedBy}`} {record.bannedAt ? `(${formatDateTimeJst(record.bannedAt).split(' ')[0]})` : ''}</p>
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
              </div>
            )}
          </div>
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
