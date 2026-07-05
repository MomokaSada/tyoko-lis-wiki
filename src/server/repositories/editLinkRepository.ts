import { desc, eq, and, sql, asc, lt, gt, lte, gte } from 'drizzle-orm';
import { escapeLikePattern } from './modules/escapeLike';
import { db } from '@/db';
import { editSessions, users } from '@/db/schema';
import type { ListQuery, ListResult } from '@/types/listQuery';
import type { StatusFilter } from '@/server/types/repositoryTypes';

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

export type EditSessionRow = {
  uuid: string;
  authorId: number;
  authorName: string | null;
  maxEdits: number;
  editsUsed: number;
  isActive: boolean;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
};

export async function findEditSessions(
  query?: ListQuery<'createdAt' | 'endAt' | 'editsUsed'>,
  statusFilter?: StatusFilter,
): Promise<ListResult<EditSessionRow>> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (query?.searchQuery) {
    const escaped = escapeLikePattern(query.searchQuery);
    conditions.push(
      sql`${editSessions.uuid}::text ilike ${`%${escaped}%`}`,
    );
  }

  if (statusFilter) {
    switch (statusFilter) {
      case 'active':
        conditions.push(
          eq(editSessions.isActive, true),
          sql`${editSessions.editsUsed} < ${editSessions.maxEdits}`,
          gt(editSessions.endAt, sql`now()`),
        );
        break;
      case 'expired':
        conditions.push(
          eq(editSessions.isActive, true),
          sql`${editSessions.editsUsed} < ${editSessions.maxEdits}`,
          lte(editSessions.endAt, sql`now()`),
        );
        break;
      case 'limit-reached':
        conditions.push(
          eq(editSessions.isActive, true),
          sql`${editSessions.editsUsed} >= ${editSessions.maxEdits}`,
        );
        break;
      case 'inactive':
        conditions.push(eq(editSessions.isActive, false));
        break;
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByColumn = query?.sortBy === 'endAt'
    ? editSessions.endAt
    : query?.sortBy === 'editsUsed'
      ? editSessions.editsUsed
      : editSessions.createdAt;
  const orderByDir = query?.sortOrder === 'asc' ? asc : desc;

  const rows = await db
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
    .where(where)
    .orderBy(orderByDir(orderByColumn))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(editSessions)
    .where(where);

  return {
    items: rows,
    totalCount: Number(countResult[0]?.count ?? 0),
  };
}

/** 有効な編集セッションを UUID で検索する（guards.ts / currentEditor.ts 用） */
export async function findActiveEditSession(uuid: string) {
  const now = new Date();
  const [session] = await db
    .select({ uuid: editSessions.uuid })
    .from(editSessions)
    .where(
      and(
        eq(editSessions.uuid, uuid),
        eq(editSessions.isActive, true),
        gt(editSessions.endAt, now),
        lt(editSessions.editsUsed, editSessions.maxEdits),
      ),
    )
    .limit(1);

  return session ?? null;
}

export async function findActiveSessionsByAuthor(
  authorId: number,
  minRemainingEdits: number,
): Promise<{
  uuid: string
}[]> {
  const sessions = await db
    .select({
      uuid: editSessions.uuid
    })
    .from(editSessions)
    .where(
      and(
        eq(editSessions.authorId, authorId),
        eq(editSessions.isActive, true),
        sql`(${editSessions.maxEdits} - ${editSessions.editsUsed}) >= ${minRemainingEdits}`,
        gt(editSessions.endAt, sql`now()`),
      ),
    )
  return sessions;
}

export async function deactivateEditSession(uuid: string) {
  const [updated] = await db
    .update(editSessions)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(editSessions.uuid, uuid))
    .returning({ uuid: editSessions.uuid });

  return updated ?? null;
}
