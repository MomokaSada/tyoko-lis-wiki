import { db } from '@/db';
import { accountCreateSessions } from '@/db/schema';

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
