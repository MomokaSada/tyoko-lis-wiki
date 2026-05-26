import { asc, eq, ilike, ne, and, sql, desc } from 'drizzle-orm';
import { escapeLikePattern } from './modules/escapeLike';
import { db } from '@/db';
import { users } from '@/db/schema';
import type { ListQuery, ListResult } from '@/types/listQuery';

export async function listManageableAccounts() {
  return db
    .select({
      id: users.id,
      name: users.name,
      type: users.type,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(ne(users.type, 'owner'))
    .orderBy(asc(users.name));
}

export type ManageableAccountRow = {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
};

export async function listManageableAccountsPaginated(
  query?: ListQuery<'name' | 'createdAt' | 'isActive'>,
): Promise<ListResult<ManageableAccountRow>> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [ne(users.type, 'owner')];

  if (query?.searchQuery) {
    const escaped = escapeLikePattern(query.searchQuery);
    conditions.push(ilike(users.name, `%${escaped}%`));
  }

  const where = and(...conditions);

  let sortColumn;
  if (query?.sortBy === 'createdAt') sortColumn = users.createdAt;
  else if (query?.sortBy === 'isActive') sortColumn = users.isActive;
  else sortColumn = users.name;
  const sortBy = sortColumn;
  const orderDir = query?.sortOrder === 'desc' ? desc : asc;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      type: users.type,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where)
    .orderBy(orderDir(sortBy))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(where);

  return {
    items: rows,
    totalCount: Number(countResult[0]?.count ?? 0),
  };
}

export async function findUserByName(name: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      type: users.type,
      isActive: users.isActive,
      authUserId: users.authUserId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.name, name), ne(users.type, 'owner')))
    .limit(1);

  return user ?? null;
}

export async function findUserById(userId: number) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.id, userId), ne(users.type, 'owner')))
    .limit(1);

  return user ?? null;
}

export async function deactivateUserById(userId: number) {
  const [updated] = await db
    .update(users)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      type: users.type,
      authUserId: users.authUserId,
    });

  return updated ?? null;
}

export async function activateUserById(userId: number) {
  const [updated] = await db
    .update(users)
    .set({
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      type: users.type,
      authUserId: users.authUserId,
    });

  return updated ?? null;
}
