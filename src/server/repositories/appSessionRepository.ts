import { db } from '@/db';
import { appSessions } from '@/db/schema/appSessions';
import { and, eq, gt, isNull } from 'drizzle-orm';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function createAppSession(data: {
    userId: number;
    sessionToken: string;
    ipAddress?: string;
    userAgent?: string;
}): Promise<{ expiresAt: Date }> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    const [session] = await db
    .insert(appSessions)
    .values({
        userId: data.userId,
        sessionToken: data.sessionToken,
        expiresAt: expiresAt,
        revokedAt: null,
        createdAt: now,
        lastUsedAt: now,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
    })
    .returning({
        expiresAt: appSessions.expiresAt
    })

    return session;
}

export async function getValidSessionByToken(
    sessionToken: string
){
    const now = new Date();

    const [session] = await db
        .select()
        .from(appSessions)
        .where(
            and(
                eq(appSessions.sessionToken, sessionToken),
                isNull(appSessions.revokedAt),
                gt(appSessions.expiresAt, now),
            ),
        )
        .limit(1);
    
    if (!session) return null;

    return session
}

export async function touchSession(
    sessionId: number
) {
    const now = new Date();
    await db
        .update(appSessions)
        .set({
            lastUsedAt: now
        })
        .where(
            eq(appSessions.id, sessionId)
        );
}

export async function revokeSession(
    sessionToken: string
) {
    await db
        .update(appSessions)
        .set({
            revokedAt: new Date()
        })
        .where(
            eq(appSessions.sessionToken, sessionToken)
        );
}
