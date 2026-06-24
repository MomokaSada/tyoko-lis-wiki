import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { contentEditLogs } from '@/db/schema';

export type EditLogRow = {
  id: number;
  title: string | null;
  data: string | null;
  thumbnail: string | null;
};

/** 指定されたリビジョンの編集ログを取得する */
export async function findEditLog(
  contentId: number,
  revisionNumber: number,
): Promise<EditLogRow | null> {
  return db
    .select({
      id: contentEditLogs.id,
      title: contentEditLogs.title,
      data: contentEditLogs.data,
      thumbnail: contentEditLogs.thumbnail,
    })
    .from(contentEditLogs)
    .where(
      and(
        eq(contentEditLogs.contentId, contentId),
        eq(contentEditLogs.revisionNumber, revisionNumber),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);
}
