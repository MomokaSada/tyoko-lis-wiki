import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

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
