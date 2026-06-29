import { findEditableContentBySlug } from '@/server/repositories/contentRepository';
import { findEditLogsByContentId } from '@/server/repositories/contentEditLogRepository';
import { findUsersByIds } from '@/server/repositories/userRepository';
import { findDeviceSessionsByIds } from '@/server/repositories/deviceRepository';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HistoryContent = {
  id: number;
  slug: string;
  currentTitle: string | null;
};

export type HistoryLogItem = {
  id: number;
  revisionNumber: number;
  type: 'snapshot' | 'diff';
  title: string | null;
  createdAt: Date;
  deviceSessionId: number | null;
  userId: number | null;
};

export type HistoryData = {
  content: HistoryContent;
  allLogs: HistoryLogItem[];
  snapshotLogs: HistoryLogItem[];
  revisionLabels: Record<number, string | null>;
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * 指定された slug のコンテンツ編集履歴データを取得する。
 * owner 権限時は編集者情報（アカウント名・編集リンクUUID）を解決する。
 */
export async function getContentHistory(
  slug: string,
  isOwner: boolean,
): Promise<HistoryData | null> {
  // 1. コンテンツを取得
  const content = await findEditableContentBySlug(slug);
  if (!content) return null;

  // 2. 編集ログを取得
  const allLogs = await findEditLogsByContentId(content.id);
  const snapshotLogs = allLogs.filter((log) => log.type === 'snapshot');

  // 3. 編集者情報を解決（owner のみ）
  const editorLabelMap = new Map<number, string>(); // key: log.id → label

  if (isOwner) {
    // userId → ユーザー名（バッチ取得）
    const userIds = allLogs.map((l) => l.userId).filter(Boolean) as number[];
    if (userIds.length > 0) {
      const foundUsers = await findUsersByIds(userIds);
      const userMap = new Map(foundUsers.map((u) => [u.id, u.name]));
      for (const log of allLogs) {
        if (log.userId && userMap.has(log.userId)) {
          editorLabelMap.set(log.id, `アカウント: ${userMap.get(log.userId)}`);
        }
      }
    }

    // deviceSessionId → 編集リンクUUID（短縮表示、バッチ取得）
    const dsIds = allLogs.map((l) => l.deviceSessionId).filter(Boolean) as number[];
    if (dsIds.length > 0) {
      const foundDs = await findDeviceSessionsByIds(dsIds);
      const dsMap = new Map(foundDs.map((d) => [d.id, d.sessionId]));
      for (const log of allLogs) {
        if (log.deviceSessionId && dsMap.has(log.deviceSessionId)) {
          const shortUuid = dsMap.get(log.deviceSessionId)!.slice(0, 8) + '…';
          editorLabelMap.set(log.id, `編集リンク: ${shortUuid}`);
        }
      }
    }
  }

  // リビジョン番号 → ラベルのマップ（DiffModal のページ移動用）
  const revisionLabels: Record<number, string | null> = {};
  if (isOwner) {
    for (const log of allLogs) {
      revisionLabels[log.revisionNumber] = editorLabelMap.get(log.id) ?? null;
    }
  }

  return {
    content: {
      id: content.id,
      slug: content.slug,
      currentTitle: content.title,
    },
    allLogs,
    snapshotLogs,
    revisionLabels,
  };
}
