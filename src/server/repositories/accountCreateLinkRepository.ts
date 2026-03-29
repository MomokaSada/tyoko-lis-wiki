import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { accountCreateSessions, users } from '@/db/schema';

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
