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
    return (
      <span className="badge badge-stone">
        <span className="badge-dot" />
        無効化済み
      </span>
    );
  }
  if (record.editsUsed >= record.maxEdits) {
    return (
      <span className="badge badge-amber">
        <span className="badge-dot" />
        上限到達
      </span>
    );
  }
  if (record.sessionEndAt <= new Date()) {
    return (
      <span className="badge badge-red">
        <span className="badge-dot" />
        期限切れ
      </span>
    );
  }
  return (
    <span className="badge badge-emerald">
      <span className="badge-dot" />
      有効
    </span>
  );
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
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 text-stone-900">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <Link2 className="w-16 h-16 text-emerald-400/30 ml-6 mt-6" />
            </div>
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">編集リンク使用状況</h1>
              </div>
              <p className="text-stone-500 text-sm pl-4">各デバイスでのセッション使用状況や監査ログの確認を行います。</p>
            </div>
          </div>
        </div>

        {!isOwner ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            この機能は owner のみ利用できます。
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-[1.75rem] overflow-hidden shadow-sm">
            {records.length === 0 ? (
              <div className="p-8">
                <p className="text-stone-500">編集リンクの使用記録はまだありません。</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {records.map((record) => (
                  <div
                    key={record.recordId}
                    className="px-6 py-4 hover:bg-amber-50/30 transition-colors flex flex-col lg:flex-row lg:items-center gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getSessionStatusBadge(record)}
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-stone-600 truncate">{record.sessionId}</p>
                        <p className="text-xs text-stone-400">
                          {record.sessionAuthorName ?? `user:${record.sessionAuthorId}`} | IP: {record.ip}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-stone-800 shrink-0 tabular-nums">
                      {record.editsUsed} / {record.maxEdits}
                      <span className="text-xs font-medium text-stone-500 ml-1">回</span>
                    </div>
                    <div className="text-xs text-stone-500 shrink-0 text-right">
                      <span className="text-stone-400">Rev:</span> {record.revisionCount}
                    </div>
                  </div>
                ))}
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
