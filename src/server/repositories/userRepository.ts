import { eq, ne, and } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import type { User } from '@/types/user';


export async function getUserProfile(
    userId: number
): Promise<User | null> {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            role: users.type,
            isActive: users.isActive,
        })
        .from(users)
        .where(
            eq(users.id, userId)
        )
        .limit(1);

    return user ?? null;
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