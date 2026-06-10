import { db } from '@/db';
import { passkeys } from '@/db/schema/passkeys';
import { eq, desc } from 'drizzle-orm';

export async function createPasskey(data: {
    userId: number;
    credentialId: string;
    publicKey: string;
    counter: number;
    transports: string;
    deviceName: string;
    backedUp: boolean;
    deviceType: string;
}) {
    const [record] = await db
    .insert(passkeys)
    .values({
        userId: data.userId,
        credentialId: data.credentialId,
        publicKey: data.publicKey,
        counter: data.counter,
        transports: data.transports,
        deviceName: data.deviceName,
        backedUp: data.backedUp,
        deviceType: data.deviceType,
    })
    .returning({
        id: passkeys.id,
        credentialId: passkeys.credentialId
    });
    return record;
}

export async function getPasskeysByUserId(
    userId: number
) {
    return db
        .select()
        .from(passkeys)
        .where(
            eq(passkeys.userId, userId)
        )
        .orderBy(
            desc(passkeys.createdAt)
        );
}

export async function getPasskeyByCredentialId(
    credentialId: string
) {
    const [record] = await db
        .select()
        .from(passkeys)
        .where(
            eq(passkeys.credentialId, credentialId)
        )
        .limit(1);
    return record ?? null;
}

export async function updatePasskeyCounter(
    passkeyId: number,
    newCounter: number
) {
    const now = new Date();
    await db
        .update(passkeys)
        .set({
            counter: newCounter,
            lastUsedAt: now
        })
        .where(
            eq(passkeys.id, passkeyId)
        );
}

export async function deletePasskey(
    passkeyId: number
) {
    await db
        .delete(passkeys)
        .where(
            eq(passkeys.id, passkeyId)
        );
}