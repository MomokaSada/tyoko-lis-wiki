import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/db';
import { accountCreateSessions, users } from '@/db/schema';

export async function findActiveAccountCreateSession(uuid: string) {
  const now = new Date();

  const [session] = await db
    .select({
      uuid: accountCreateSessions.uuid,
      isActive: accountCreateSessions.isActive,
      endAt: accountCreateSessions.endAt,
    })
    .from(accountCreateSessions)
    .where(
      and(
        eq(accountCreateSessions.uuid, uuid),
        eq(accountCreateSessions.isActive, true),
        gt(accountCreateSessions.endAt, now),
      ),
    )
    .limit(1);

  return session ?? null;
}

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

export async function createInvitedUser(data: {
  sessionId: string;
  authUserId: string;
  username: string;
  passwordHash: string;
  type: 'admin' | 'bot';
}) {
  return db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({
        accountCreateSessionId: data.sessionId,
        authUserId: data.authUserId,
        name: data.username,
        password: data.passwordHash,
        type: data.type,
        isActive: true,
      })
      .returning({
        id: users.id,
        name: users.name,
        type: users.type,
      });

    await tx
      .update(accountCreateSessions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(accountCreateSessions.uuid, data.sessionId));

    return createdUser;
  });
}
