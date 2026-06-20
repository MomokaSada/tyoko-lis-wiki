'use server'

import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { createAppSession } from '@/server/repositories/appSessionRepository';
import { findUserByName } from '@/server/repositories/authRepository';
import {
    createChallenge,
    getValidChallenge,
    markChallengeConsumed,
} from '@/server/repositories/webauthnChallengeRepository'
import {
    createPasskey,
    getPasskeysByUserId,
    getPasskeyByCredentialId,
    updatePasskeyCounter,
} from '@/server/repositories/passkeyRepository';
import { getUserProfile } from '@/server/repositories/userRepository';
import {
    RP_NAME,
    RP_ID,
    RP_ORIGIN,
    parseTransports
} from './modules/webauthn';
import { getCurrentActor } from '@/server/lib/currentActor';
import { generateToken } from '@/server/lib/generateToken';
import { setSessionCookie } from '@/server/lib/appSessionCookie';
import { recordAuditLog } from '@/server/services/auditLogService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';
import { withAction } from '@/server/actions/modules/withAction';
import {
    authenticationResponseSchema,
    challengeIdSchema,
    registrationResponseSchema,
} from '@/server/schemas/passkeySchemas';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { BaseActionState } from '@/types/actionState';
import { isUniqueViolation } from '@/server/lib/pgError';

export type PasskeyActionState = BaseActionState & {
    options?: unknown;
    challengeId?: number;
};

export async function startPasskeyRegistrationAction(
): Promise<PasskeyActionState> {
    const preflight = await withAction({ rateLimit: 'login' });
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

export async function startPasskeyLoginAction(
    prevState: PasskeyActionState,
    formData: FormData,
): Promise<PasskeyActionState> {
    const preflight = await withAction({
        rateLimit: 'login'
    });
    if (preflight) return preflight;

    const activeBan = await getCurrentRequestBan();
    if (activeBan) {
        return {
            error: 'このIPアドレスからのログインは許可されていません'
        };
    }
    const userName = formData.get('userName') as string | null;
    let allowCredentials: {
        id: string;
        type: 'public-key';
        transports: AuthenticatorTransportFuture[]
    }[] = [];

    if (userName) {
        const user = await findUserByName(userName);
        if (user) {
            const passkey = await getPasskeysByUserId(user.id);
            allowCredentials = passkey.map((pk) => ({
                id: pk.credentialId,
                type: 'public-key' as const,
                transports: parseTransports(pk.transports ?? ""),
            }));
        }
    }
    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        userVerification: 'required',
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    });

    const challengeRecord = await createChallenge({
        purpose: 'login',
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
    if (!challengeRecord) {
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

export async function finishPasskeyLoginAction(
    prevState: PasskeyActionState,
    formData: FormData,
): Promise<PasskeyActionState> {
    const preflight = await withAction({
        rateLimit: 'login'
    });
    if (preflight) return preflight;

    const parsed = authenticationResponseSchema.safeParse(formData.get('credential'));
    if (!parsed.success) {
        return {
            error: '認証情報のパーズに失敗しました'
        }
    }
    const credential = parsed.data;

    const passkey = await getPasskeyByCredentialId(credential.id);
    if (!passkey) {
        await recordAuditLog({
            actorId: null,
            action: 'passkey_login_failed',
            detail: {
                reason: 'credential_not_found'
            },
        });
        return {
            error: '認証情報が見つかりません'
        };
    }

    const parsedId = challengeIdSchema.safeParse(formData.get('challengeId'));
    if (!parsedId.success) {
        return {
            error: 'チャレンジ情報が見つかりません。もう一度やり直してください。'
        }
    }
    const challengeId = parsedId.data;

    const challengeRecord = await getValidChallenge(challengeId, 'login');
    if (!challengeRecord) {
        return {
            error: 'チャレンジが見つかりません。もう一度やり直してください。'
        }
    }

    try {
        const verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge: challengeRecord.challenge,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: passkey.credentialId,
                publicKey: new Uint8Array(
                    Buffer.from(passkey.publicKey, 'base64url'),
                ),
                counter: passkey.counter,
                transports: parseTransports(passkey.transports ?? ""),
            },
        });

        if (!verification.verified) {
            await recordAuditLog({
                actorId: passkey.userId,
                action: 'passkey_login_failed',
                detail: {
                    reason: 'verification_failed'
                },
            });
            return {
                error: '認証に失敗しました'
            };
        }

        await updatePasskeyCounter(
            passkey.id,
            verification.authenticationInfo.newCounter,
        );

        await markChallengeConsumed(challengeRecord.id);


        const headersList = await headers();
        const clientIp = headersList.get('x-client-ip') ?? undefined;
        const userAgent = headersList.get('user-agent') ?? undefined;

        let sessionToken: string | undefined;
        for (let i = 0; i < 3; i++) {
            try {
                sessionToken = generateToken();
                const { expiresAt } = await createAppSession({
                    userId: passkey.userId,
                    sessionToken,
                    ipAddress: clientIp,
                    userAgent
                });

                await setSessionCookie(sessionToken, expiresAt);
                await recordAuditLog({
                    actorId: passkey.userId,
                    action: 'passkey_login',
                });
                break;
            } catch (error) {
                if (!isUniqueViolation(error)) throw error;
                console.warn('Token conflict, retrying...');
            }
        }
        if (!sessionToken) {
            return {
                error: 'セッション作成に失敗しました'
            };
        }
    } catch (error) {
        console.error('[passkey] Login verification error:', error);
        return {
            error: '認証処理中にエラーが発生しました'
        };
    }

    redirect('/');
}