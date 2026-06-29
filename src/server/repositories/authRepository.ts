import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function findUserByName(name: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  return user ?? null;
}

/** パスワードハッシュ付きでユーザーを検索（認証検証用） */
export async function findUserByNameWithPassword(name: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      password: users.password,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  return user ?? null;
}

export async function createInvitedUser(data: {
  sessionId: string;
  authUserId: string;
  userName: string;
  passwordHash: string;
  type: 'admin' | 'bot';
}) {
  const [createdUser] = await db
    .insert(users)
    .values({
      accountCreateSessionId: data.sessionId,
      authUserId: data.authUserId,
      name: data.userName,
      password: data.passwordHash,
      type: data.type,
      isActive: true,
    })
    .returning({
      id: users.id,
      name: users.name,
      type: users.type,
    });

  return createdUser;
}
