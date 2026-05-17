import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getDeviceSessionUsageRecords } from '@/server/services/deviceService';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';
import { Link2, AlertTriangle } from 'lucide-react';

function getSessionStatusBadge(record: {
  sessionIsActive: boolean;
  sessionEndAt: Date;
  editsUsed: number;
  maxEdits: number;
}) {
  if (!record.sessionIsActive) {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> 無効化済み</span>;
  }
  if (record.editsUsed >= record.maxEdits) {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> 上限到達</span>;
  }
  if (record.sessionEndAt <= new Date()) {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 期限切れ</span>;
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 有効</span>;
}

export default async function EditLinkUsagePage() {
  const actor = await getCurrentActor();
  const records = actor ? await getDeviceSessionUsageRecords(actor) : [];
  const isOwner = actor?.role === 'owner';

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-stone-900">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-800 tracking-tighter mb-1">編集リンク使用状況</h1>
            <p className="text-stone-500 font-medium text-sm">各デバイスでのセッション使用状況や監査ログの確認を行います。</p>
          </div>
        </div>

        {!isOwner ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            この機能は owner のみ利用できます。
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">使用記録一覧</h2>

            {records.length === 0 ? (
              <p className="text-stone-500">編集リンクの使用記録はまだありません。</p>
            ) : (
              <div>
                {/* Mobile View: Card List */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {records.map((record) => (
                    <div key={record.recordId} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        {getSessionStatusBadge(record)}
                        <div className="text-right">
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Usage</div>
                          <div className="text-sm font-black text-stone-800">{record.editsUsed} / {record.maxEdits} 回</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Session ID</div>
                        <div className="font-mono text-xs text-stone-600 break-all bg-white border border-stone-100 p-2 rounded-lg">{record.sessionId}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Author & Network</div>
                        <div className="flex justify-between items-end">
                          <div className="font-medium text-stone-700">{record.sessionAuthorName ?? `user:${record.sessionAuthorId}`}</div>
                          <div className="font-mono text-xs text-stone-500">{record.ip}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="text-xs">
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">First Recorded</div>
                          <div className="font-medium text-stone-500">{formatDateTimeJst(record.firstRecordedAt)}</div>
                        </div>
                        <div className="text-xs">
                          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Last Recorded</div>
                          <div className="font-medium text-stone-500">{formatDateTimeJst(record.lastRecordedAt)}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Browser & Revisions</div>
                        <div className="text-xs text-stone-500 line-clamp-1">{record.browser}</div>
                        <div className="text-[10px] text-stone-400 font-bold">Total Revisions: {record.revisionCount}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3 px-4">Status & UUID</th>
                        <th className="pb-3 px-4">Author Info</th>
                        <th className="pb-3 px-4">Device & IP</th>
                        <th className="pb-3 px-4">Usage (Edits/Revs)</th>
                        <th className="pb-3 px-4">Recorded Dates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {records.map((record) => (
                        <tr key={record.recordId} className="hover:bg-stone-50 transition-colors group">
                          <td className="py-4 px-4">
                            <div className="mb-2">{getSessionStatusBadge(record)}</div>
                            <div className="font-mono text-xs text-stone-600 block">{record.sessionId}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-stone-700">{record.sessionAuthorName ?? `user:${record.sessionAuthorId}`}</div>
                            <div className="text-[10px] text-stone-400 mt-1">
                              Start: {formatDateTimeJst(record.sessionStartAt).split(' ')[0]}<br />
                              End: {formatDateTimeJst(record.sessionEndAt).split(' ')[0]}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-mono text-stone-800 mb-1">{record.ip}</div>
                            <div className="text-[10px] text-stone-400 max-w-[150px] truncate" title={record.browser}>{record.browser}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-stone-800 mb-1">{record.editsUsed} / {record.maxEdits} 回</div>
                            <div className="text-xs text-stone-500">Revisions: {record.revisionCount}</div>
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-stone-500">
                            <div><span className="text-stone-400">First:</span> {formatDateTimeJst(record.firstRecordedAt)}</div>
                            <div><span className="text-stone-400">Last:</span> {formatDateTimeJst(record.lastRecordedAt)}</div>
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

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
