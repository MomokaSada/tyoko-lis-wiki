import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getDeviceSessionUsageRecords } from '@/server/services/deviceService';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';
import { Link2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { OwnerLayout } from '@/components/layout/admin/OwnerLayout';

function getSessionStatusBadge(record: {
  sessionIsActive: boolean;
  sessionEndAt: Date;
  editsUsed: number;
  maxEdits: number;
}) {
  if (!record.sessionIsActive) {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> Inactive</span>;
  }
  if (record.editsUsed >= record.maxEdits) {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Limit Reached</span>;
  }
  if (record.sessionEndAt <= new Date()) {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Expired</span>;
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active</span>;
}

export default async function EditLinkUsagePage() {
  const actor = await getCurrentActor();
  const records = actor ? await getDeviceSessionUsageRecords(actor) : [];
  const isOwner = actor?.role === 'owner';

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  if (!isOwner) {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
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
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <Link2 size={14} />
              <span>Owner Audit</span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">編集リンク使用状況</h1>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Link2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase">Total Records</p>
              <p className="text-2xl font-black text-stone-900">{records.length}件</p>
            </div>
          </div>
        </div>

        {/* Data Table Panel */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-lg font-black text-stone-800">使用記録一覧</h2>
          </div>

          {records.length === 0 ? (
            <div className="p-12 text-center text-stone-500 font-medium">
              編集リンクの使用記録はまだありません。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Status & Session</th>
                    <th className="py-4 px-6">Author Info</th>
                    <th className="py-4 px-6">Device & Network</th>
                    <th className="py-4 px-6">Usage / Revs</th>
                    <th className="py-4 px-6">Recording Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {records.map((record) => (
                    <tr key={record.recordId} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="mb-2">{getSessionStatusBadge(record)}</div>
                        <div className="font-mono text-[10px] text-stone-400 break-all">{record.sessionId}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-stone-800">{record.sessionAuthorName ?? `user:${record.sessionAuthorId}`}</div>
                        <div className="text-[10px] text-stone-400 mt-1 leading-tight">
                          S: {formatDateTimeJst(record.sessionStartAt).split(' ')[0]}<br />
                          E: {formatDateTimeJst(record.sessionEndAt).split(' ')[0]}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-stone-800 text-xs mb-1">{record.ip}</div>
                        <div className="text-[10px] text-stone-400 max-w-[150px] truncate" title={record.browser}>{record.browser}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-black text-stone-800">{record.editsUsed} / {record.maxEdits} 回</div>
                        <div className="text-[10px] text-stone-500 font-medium">Revisions: {record.revisionCount}</div>
                      </td>
                      <td className="py-4 px-6 text-xs font-medium text-stone-500">
                        <div className="flex flex-col gap-1">
                          <span><span className="text-stone-400">First:</span> {formatDateTimeJst(record.firstRecordedAt).split(' ')[0]}</span>
                          <span><span className="text-stone-400">Last:</span> {formatDateTimeJst(record.lastRecordedAt).split(' ')[0]}</span>
                        </div>
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
