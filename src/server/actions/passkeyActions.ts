'use server'

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
    createChallenge,
    getValidChallenge,
    markChallengeConsumed,
} from '@/server/repositories/webauthnChallengeRepository'
import { 
    createPasskey,
    getPasskeysByUserId
} from '@/server/repositories/passkeyRepository';
import { getUserProfile } from '@/server/repositories/userRepository';
import { 
    RP_NAME,
    RP_ID,
    RP_ORIGIN,
    parseTransports
} from './modules/webauthn';
import { getCurrentActor  } from '@/server/lib/currentActor';
import { recordAuditLog } from '@/server/services/auditLogService';
import { withAction } from '@/server/actions/modules/withAction';
import { 
    challengeIdSchema,
    registrationResponseSchema,
} from '@/server/schemas/passkeySchemas';
import type { BaseActionState } from '@/types/actionState';

export type PasskeyActionState = BaseActionState & {
    options?: unknown;
    challengeId?: number;
};

export async function startPasskeyRegistrationAction(
): Promise<PasskeyActionState> {
    const preflight = await withAction({rateLimit: 'login'});
    if (preflight) return preflight;

    const actor = await getCurrentActor();
    if (!actor) {
        return { 
            error: 'ログインが必須です'
        };
    }

    const existingPasskeys = await getPasskeysByUserId(actor.id);
    const userProfile = await getUserProfile(actor.id);

    if (!userProfile) return {
        error: 'ユーザー情報が見つかりません'
    };

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userName: userProfile.name,
        excludeCredentials: existingPasskeys.map((pk) => ({
            id: pk.credentialId,
            transports: parseTransports(pk.transports ?? ""),
        })),
        authenticatorSelection: {
            userVerification: 'required',
            residentKey: 'required',
        },
    });

    const challengeRecord = await createChallenge({
        purpose: 'register',
        userId: actor.id,
        challenge: options.challenge,
    });

    return {
        error: null,
        options,
        challengeId: challengeRecord.id
    };
}

export async function finishPasskeyRegistrationAction(
    prevState: PasskeyActionState,
    formData: FormData
): Promise<PasskeyActionState> {
    const preflight = await withAction({
        rateLimit: 'login'
    });
    if (preflight) return preflight;

    const actor = await getCurrentActor();
    if (!actor) {
        return {
            error: 'ログインが必須です'
        };
    }

    const parsed = registrationResponseSchema.safeParse(formData.get('credential'));
    if (!parsed.success) {
        return {
            error: '認証情報のパースに失敗しました'
        };
    }
    const credential = parsed.data;

    const parsedId = challengeIdSchema.safeParse(formData.get('challengeId'));
    if (!parsedId.success) {
        return {
            error: 'チャレンジ情報が見つかりません。もう一度やり直してください'
        };
    }
    const challengeId = parsedId.data;

    const challengeRecord = await getValidChallenge(challengeId, 'register', actor.id);
    if (!challengeRecord){
        return {
            error: 'チャレンジが見つかりません。もう一度やり直してください'
        }
    }

    try {
        const verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge: challengeRecord.challenge,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
        });
        
        if (!verification.verified || !verification.registrationInfo) {
            return {
                error: '認証に失敗しました'
            };
        }

        const {
            credential: webAuthnCred,
            credentialDeviceType,
            credentialBackedUp,
        } = verification.registrationInfo;

        await createPasskey({
            userId: actor.id,
            credentialId: webAuthnCred.id,
            publicKey: Buffer.from(webAuthnCred.publicKey).toString('base64url'),
            counter: webAuthnCred.counter,
            transports: webAuthnCred.transports?.join(',') ?? '',
            deviceName: '',
            backedUp: credentialBackedUp,
            deviceType: credentialDeviceType,
        });

        await markChallengeConsumed(challengeRecord.id);

        await recordAuditLog({
            actorId: actor.id,
            action: 'passkey_register',
            targetType: 'user',
            targetId: String(actor.id)
        });
    } catch (error) {
        console.error('[passkey] Registration verification error:', error);
        return {
            error: '認証中にエラーが発生しました'
        };
    }

    return {
        error: null
    }
}