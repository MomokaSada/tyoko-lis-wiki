import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileEdit } from 'lucide-react';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getDeviceSessionUsageDetail } from '@/server/services/deviceService';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { DeviceInfoModal } from './device-info-modal';
import { DiffModal } from './diff-modal';

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function EditLinkUsageDetailPage(props: Props) {
  const searchParams = await props.searchParams;
  const id = searchParams.id;
  if (!id) notFound();

  const recordId = Number(id);
  if (Number.isNaN(recordId)) notFound();

  const actor = await getCurrentActor();
  if (actor?.role !== 'owner') notFound();

  const detail = await getDeviceSessionUsageDetail(actor, recordId);
  if (!detail) notFound();

  const { record, editLogs } = detail;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 text-stone-900">
      {/* 戻る */}
      <Link
        href="/owner/edit-link-usage"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        編集リンク使用状況一覧に戻る
      </Link>

      {/* タイトル: セッションUUID／作成者／作成日時 */}
      <div className="animate-float-in">
        <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
            <FileEdit className="w-16 h-16 text-emerald-400/30 ml-6 mt-6" />
          </div>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
              <h1 className="text-3xl font-black text-stone-900 tracking-tight">編集セッション詳細</h1>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm">
              <div>
                <span className="text-stone-400 font-bold">セッションUUID</span>
                <code className="ml-2 font-mono bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200">
                  {record.sessionId}
                </code>
              </div>
              <div>
                <span className="text-stone-400 font-bold">作成者</span>
                <span className="ml-2 font-bold text-stone-800">
                  {record.sessionAuthorName ?? `user:${record.sessionAuthorId}`}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-bold">作成日時</span>
                <span className="ml-2 text-stone-700">{formatDateTimeJst(record.sessionCreatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* セッション詳細テーブル */}
      <div className="card">
        <div className="card-body space-y-5">
          <h2 className="font-bold text-stone-800 flex items-center gap-2 text-lg">
            <FileEdit className="w-5 h-5 text-stone-400" />
            操作一覧
            <span className="text-sm font-medium text-stone-400 ml-1">（{editLogs.length}件）</span>
          </h2>

          {editLogs.length === 0 ? (
            <p className="text-sm text-stone-400 py-8 text-center">このセッションによる操作は記録されていません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>操作対象コンテンツ</th>
                    <th style={{ textAlign: 'center' }}>デバイス情報</th>
                    <th className="whitespace-nowrap" style={{ textAlign: 'center' }}>操作日時</th>
                    <th style={{ textAlign: 'center' }}>リビジョン</th>
                    <th style={{ textAlign: 'center' }}>種別</th>
                    <th style={{ textAlign: 'center' }}>差分</th>
                  </tr>
                </thead>
                <tbody>
                  {editLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-left">
                        <Link
                          href={`/posts/modify?slug=${log.slug}`}
                          className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                        >
                          {log.title ?? log.slug}
                        </Link>
                      </td>
                      <td className="text-center">
                        <DeviceInfoModal ip={record.ip} browser={record.browser} />
                      </td>
                      <td className="text-center whitespace-nowrap text-sm text-stone-500">
                        {formatDateTimeJst(log.createdAt)}
                      </td>
                      <td className="text-center text-sm text-stone-600 tabular-nums">
                        v{log.revisionNumber}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${log.type === 'snapshot' ? 'badge-emerald' : 'badge-stone'}`}>
                          {log.type === 'snapshot' ? 'スナップショット' : log.type}
                        </span>
                      </td>
                      <td className="text-center">
                        <DiffModal contentId={log.contentId} revisionNumber={log.revisionNumber} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="pt-4">
        <Link
          href="/owner/edit-link-usage"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          編集リンク使用状況一覧に戻る
        </Link>
      </div>
    </div>
  );
}
