import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { editSessions, users } from '@/db/schema';

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

export async function findEditSessions() {
  return db
    .select({
      uuid: editSessions.uuid,
      authorId: editSessions.authorId,
      authorName: users.name,
      maxEdits: editSessions.maxEdits,
      editsUsed: editSessions.editsUsed,
      isActive: editSessions.isActive,
      startAt: editSessions.startAt,
      endAt: editSessions.endAt,
      createdAt: editSessions.createdAt,
    })
    .from(editSessions)
    .leftJoin(users, eq(editSessions.authorId, users.id))
    .orderBy(desc(editSessions.createdAt));
}
