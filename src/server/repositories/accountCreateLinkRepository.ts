import { asc, desc, eq, ilike, and, sql } from 'drizzle-orm';
import { escapeLikePattern } from './modules/escapeLike';
import { db } from '@/db';
import { accountCreateSessions, users } from '@/db/schema';
import type { ListQuery, ListResult } from '@/types/listQuery';

export async function insertAccountCreateSession(data: {
    uuid: string;
    authId: number;
    startAt: Date;
    endAt: Date;
}) {
    const [created] = await db
        .insert(accountCreateSessions)
        .values({
            uuid: data.uuid,
            authorId: data.authId,
            isActive: true,
            startAt: data.startAt,
            endAt: data.endAt,
    })
    .returning();
    return created;
}

export async function findAccountCreateSessions() {
    return db
        .select({
            uuid: accountCreateSessions.uuid,
            authorId: accountCreateSessions.authorId,
            authorName: users.name,
            isActive: accountCreateSessions.isActive,
            startAt: accountCreateSessions.startAt,
            endAt: accountCreateSessions.endAt,
            createdAt: accountCreateSessions.createdAt,
        })
        .from(accountCreateSessions)
        .leftJoin(users, eq(accountCreateSessions.authorId, users.id))
        .orderBy(desc(accountCreateSessions.createdAt));
}

export type AccountCreateSessionRow = {
  uuid: string;
  authorId: number;
  authorName: string | null;
  isActive: boolean;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
};

export async function findAccountCreateSessionsPaginated(
  query?: ListQuery<'createdAt' | 'endAt'>,
): Promise<ListResult<AccountCreateSessionRow>> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (query?.searchQuery) {
    const escaped = escapeLikePattern(query.searchQuery);
    conditions.push(
      ilike(accountCreateSessions.uuid, `%${escaped}%`),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByColumn = query?.sortBy === 'endAt'
    ? accountCreateSessions.endAt
    : accountCreateSessions.createdAt;
  const orderByDir = query?.sortOrder === 'asc' ? asc : desc;

  const rows = await db
    .select({
      uuid: accountCreateSessions.uuid,
      authorId: accountCreateSessions.authorId,
      authorName: users.name,
      isActive: accountCreateSessions.isActive,
      startAt: accountCreateSessions.startAt,
      endAt: accountCreateSessions.endAt,
      createdAt: accountCreateSessions.createdAt,
    })
    .from(accountCreateSessions)
    .leftJoin(users, eq(accountCreateSessions.authorId, users.id))
    .where(where)
    .orderBy(orderByDir(orderByColumn))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(accountCreateSessions)
    .where(where);

  return {
    items: rows,
    totalCount: Number(countResult[0]?.count ?? 0),
  };
}

export async function deactivateAccountCreateSession(uuid: string) {
    const [updated] = await db
        .update(accountCreateSessions)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(accountCreateSessions.uuid, uuid))
        .returning({
            uuid: accountCreateSessions.uuid,
        });

    return updated ?? null;
}
