import { eq, and, gt, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { contentEditLogs, contentEditLogTags, contentEditLogCategories } from '@/db/schema';

/** スナップショット間隔：N 件の diff ごとにスナップショットを生成 */
export const SNAPSHOT_INTERVAL = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EditLogListItem = {
  id: number;
  revisionNumber: number;
  type: 'snapshot' | 'diff';
  title: string | null;
  createdAt: Date;
  deviceSessionId: number | null;
  userId: number | null;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * 指定コンテンツの全編集ログをリビジョン昇順で取得する。
 */
export async function findEditLogsByContentId(
  contentId: number,
  options?: { type?: 'snapshot' | 'diff' },
): Promise<EditLogListItem[]> {
  const conditions = [eq(contentEditLogs.contentId, contentId)];
  if (options?.type) {
    conditions.push(eq(contentEditLogs.type, options.type));
  }

  return db
    .select({
      id: contentEditLogs.id,
      revisionNumber: contentEditLogs.revisionNumber,
      type: contentEditLogs.type,
      title: contentEditLogs.title,
      createdAt: contentEditLogs.createdAt,
      deviceSessionId: contentEditLogs.deviceSessionId,
      userId: contentEditLogs.userId,
    })
    .from(contentEditLogs)
    .where(and(...conditions))
    .orderBy(asc(contentEditLogs.revisionNumber));
}

/**
 * 指定コンテンツの最終スナップショット以降の diff 数をカウントする。
 * スナップショットが1つもない（初回編集）場合は 0 を返す。
 */
export async function countDiffsSinceLastSnapshot(
  contentId: number,
): Promise<number> {
  // 最新のスナップショットのリビジョン番号を取得
  const [lastSnapshot] = await db
    .select({ revisionNumber: contentEditLogs.revisionNumber })
    .from(contentEditLogs)
    .where(
      and(
        eq(contentEditLogs.contentId, contentId),
        eq(contentEditLogs.type, 'snapshot'),
      ),
    )
    .orderBy(desc(contentEditLogs.revisionNumber))
    .limit(1);

  if (!lastSnapshot) return 0;

  // スナップショットより後の diff をカウント
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contentEditLogs)
    .where(
      and(
        eq(contentEditLogs.contentId, contentId),
        eq(contentEditLogs.type, 'diff'),
        gt(contentEditLogs.revisionNumber, lastSnapshot.revisionNumber),
      ),
    );

  return result?.count ?? 0;
}

/**
 * 次に保存する編集ログの type を判定する。
 * - 初回リビジョン → 'snapshot'
 * - SNAPSHOT_INTERVAL 回の diff が蓄積された → 'snapshot'
 * - それ以外 → 'diff'
 */
export async function determineNextLogType(
  contentId: number,
  nextRevisionNumber: number,
): Promise<'snapshot' | 'diff'> {
  // 初回リビジョンは常にスナップショット
  if (nextRevisionNumber === 1) return 'snapshot';

  const diffCount = await countDiffsSinceLastSnapshot(contentId);
  return diffCount >= SNAPSHOT_INTERVAL ? 'snapshot' : 'diff';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asc(col: any) {
  return sql`${col} asc`;
}
