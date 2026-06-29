import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getContentHistory } from '@/server/services/historyService';
import { HistoryTable } from './history-table';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PostHistoryPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = (() => {
    try {
      return decodeURIComponent(rawSlug);
    } catch {
      return rawSlug;
    }
  })();

  // owner 権限チェック（編集者情報の表示に使用）
  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const isOwner = userRole === 'owner';

  // Service 層から履歴データを取得
  const historyData = await getContentHistory(slug, isOwner);
  if (!historyData) notFound();

  const { content, allLogs, snapshotLogs, revisionLabels } = historyData;

  // シリアライズ
  const serializeLog = (log: typeof allLogs[number]) => ({
    id: log.id,
    revisionNumber: log.revisionNumber,
    type: log.type,
    title: log.title,
    createdAt: log.createdAt.toISOString(),
    editorLabel: isOwner
      ? (revisionLabels[log.revisionNumber] ?? null)
      : null,
  });

  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* ヒーロー */}
      <div className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Link
            href={`/posts/${encodeURIComponent(content.slug)}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            項目に戻る
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white/60">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">編集履歴</h1>
              <p className="text-sm text-stone-400 mt-1">{content.currentTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* メイン */}
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-500 delay-150">
        <HistoryTable
          allLogs={allLogs.map(serializeLog)}
          snapshotLogs={snapshotLogs.map(serializeLog)}
          contentId={content.id}
          revisionLabels={revisionLabels}
        />
      </div>
    </div>
  );
}
