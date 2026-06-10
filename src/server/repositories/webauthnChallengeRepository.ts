import { db } from '@/db';
import { webauthnChallenges } from '@/db/schema';
import { and, eq, isNull, gt, lt } from 'drizzle-orm';

export async function createChallenge(data: {
    purpose: 'register' | 'login';
    userId?: number;
    challenge: string;
}): Promise<{ id: number }> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const [record] = await db
        .insert(webauthnChallenges)
        .values({
            purpose: data.purpose,
            userId: data.userId ?? null,
            challenge: data.challenge,
            expiresAt: expiresAt,
            consumedAt: null,
            createdAt: now,
        })
        .returning({ id: webauthnChallenges.id });
    
    return { id: record.id };
}

export async function getValidChallenge(
    challengeId: number,
    purpose: 'register' | 'login',
    userId?: number,
): Promise<typeof webauthnChallenges.$inferSelect | null> {
    const conditions: ReturnType<typeof eq>[] = [
        eq(webauthnChallenges.id, challengeId),
        eq(webauthnChallenges.purpose, purpose),
        isNull(webauthnChallenges.consumedAt),
        gt(webauthnChallenges.expiresAt, new Date()),
    ];
    if (userId !== undefined) {
        conditions
            .push(
                eq(webauthnChallenges.userId, userId)
            )
    }

    const [record] = await db
        .select()
        .from(webauthnChallenges)
        .where(
            and(...conditions)
        )
        .limit(1);

    return record ?? null;
}

export async function markChallengeConsumed(
    challengeId: number
) {
    const now = new Date();
    await db
        .update(webauthnChallenges)
        .set({
            consumedAt: now
        })
        .where(
            eq(webauthnChallenges.id, challengeId)
        );
}

export async function deleteExpiredChallenges(
): Promise<{ deletedCount: number }> {
    const now = new Date();
    const result = await db
        .delete(webauthnChallenges)
        .where(
            lt(webauthnChallenges.expiresAt, now)
        )
        .returning({ id: webauthnChallenges.id });

    return { deletedCount: result.length}
}