import { db } from '@/db';
import { editSessions } from '@/db/schema';

export async function insertEditSession(data: {
  uuid: string;
  authorId: number;
  maxEdits: number;
  startAt: Date;
  endAt: Date;
}) {
  const [created] = await db
    .insert(editSessions)
    .values({
      uuid: data.uuid,
      authorId: data.authorId,
      maxEdits: data.maxEdits,
      editsUsed: 0,
      isActive: true,
      startAt: data.startAt,
      endAt: data.endAt,
    })
    .returning();

  return created;
}
