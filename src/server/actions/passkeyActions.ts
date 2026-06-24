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
import { withAction, parseOrError } from '@/server/actions/modules/withAction';
import {
    authenticationResponseSchema,
    challengeIdSchema,
    registrationResponseSchema,
} from '@/server/schemas/passkeySchemas';
import { loginSchema } from '@/server/schemas/authSchemas';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signIn, verifyCredentials } from '@/server/services/authService';

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

// ---------------------------------------------------------------------------
// ログイン + パスキー自動登録（方式E）
// ---------------------------------------------------------------------------

/**
 * ユーザー名+パスワードで認証し、同時にパスキー登録を開始する。
 * 認証成功後、WebAuthn 登録 options を返す（リダイレクトはしない）。
 * 
 * 注意: このアクションはセッションを作成しない。
 * パスワードハッシュを直接検証するだけで、Supabase Auth のセッションは
 * 後続の finishPasskeyLoginAndRegistrationAction で作成される。
 * クライアント側で navigator.credentials.create() → finishPasskeyLoginAndRegistrationAction と続ける想定。
 */
export async function loginAndStartPasskeyRegistrationAction(
    prevState: PasskeyActionState,
    formData: FormData,
): Promise<PasskeyActionState> {
    const preflight = await withAction({ rateLimit: 'login' });
    if (preflight) return preflight;

    const parsed = parseOrError(loginSchema, {
        userName: formData.get('userName'),
        password: formData.get('password'),
    });
    if ('error' in parsed) return parsed;

    const activeBan = await getCurrentRequestBan();
    if (activeBan) {
        return { error: 'このIPアドレスからのログインは許可されていません' };
    }

    // パスワードハッシュを検証（セッションは作成しない）
    const credResult = await verifyCredentials(parsed.parsed);
    if (!credResult.success) {
        await recordAuditLog({
            actorId: null,
            action: 'login_failed',
            detail: { userName: parsed.parsed.userName },
        });
        return { error: credResult.error };
    }

    const userProfile = await getUserProfile(credResult.userId);
    if (!userProfile) {
        return { error: 'ユーザー情報が見つかりません' };
    }

    const existingPasskeys = await getPasskeysByUserId(credResult.userId);

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
        userId: credResult.userId,
        challenge: options.challenge,
    });

    return {
        error: null,
        options,
        challengeId: challengeRecord.id,
    };
}

// ---------------------------------------------------------------------------
// ログイン + パスキー登録 完了（方式E 後半）
// ---------------------------------------------------------------------------

/**
 * パスキー登録を完了し、続けて Supabase Auth のセッションを作成する。
 *
 * このアクションは loginAndStartPasskeyRegistrationAction と対になっており、
 * クライアント側で startRegistration() が成功した後に呼ばれる。
 * パスキー保存 → signIn の順に実行するため、パスキー保存に失敗しても
 * セッションは作成されず、ログイン状態が中途半端に残ることはない。
 */
export async function finishPasskeyLoginAndRegistrationAction(
    prevState: PasskeyActionState,
    formData: FormData,
): Promise<PasskeyActionState> {
    const preflight = await withAction({ rateLimit: 'login' });
    if (preflight) return preflight;

    // --- credential のパース ---
    const parsed = registrationResponseSchema.safeParse(formData.get('credential'));
    if (!parsed.success) {
        return { error: '認証情報のパースに失敗しました' };
    }
    const credential = parsed.data;

    // --- challengeId のパース ---
    const parsedId = challengeIdSchema.safeParse(formData.get('challengeId'));
    if (!parsedId.success) {
        return { error: 'チャレンジ情報が見つかりません。もう一度やり直してください' };
    }
    const challengeId = parsedId.data;

    // --- userName の取得 ---
    const userName = formData.get('userName') as string | null;
    if (!userName) {
        return { error: 'ユーザー名が見つかりません' };
    }
    const password = formData.get('password') as string | null;
    if (!password) {
        return { error: 'パスワードが見つかりません' };
    }

    // --- challenge の検証（userId フィルターなし：セッションが未作成のため） ---
    const challengeRecord = await getValidChallenge(challengeId, 'register');
    if (!challengeRecord || challengeRecord.userId == null) {
        return { error: 'チャレンジが見つかりません。もう一度やり直してください' };
    }
    const userId = challengeRecord.userId;

    // --- WebAuthn 検証 ---
    try {
        const verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge: challengeRecord.challenge,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
        });

        if (!verification.verified || !verification.registrationInfo) {
            return { error: '認証に失敗しました' };
        }

        const {
            credential: webAuthnCred,
            credentialDeviceType,
            credentialBackedUp,
        } = verification.registrationInfo;

        // パスキーを保存
        await createPasskey({
            userId,
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
            actorId: userId,
            action: 'passkey_register',
            targetType: 'user',
            targetId: String(userId),
        });

        // --- Supabase Auth セッションを作成 ---
        const signInResult = await signIn({ userName, password });
        if (!signInResult.success) {
            // ここでエラーになるのは異常系（パスワードは step1 で確認済み）
            console.error('[passkey] signIn after registration failed unexpectedly:', signInResult.error);
            return { error: 'セッションの作成に失敗しました。再度ログインしてください' };
        }

        // アプリケーションセッションを作成
        const headersList = await headers();
        const clientIp = headersList.get('x-client-ip') ?? undefined;
        const userAgent = headersList.get('user-agent') ?? undefined;

        let sessionToken: string | undefined;
        for (let i = 0; i < 3; i++) {
            try {
                sessionToken = generateToken();
                const { expiresAt } = await createAppSession({
                    userId,
                    sessionToken,
                    ipAddress: clientIp,
                    userAgent,
                });
                await setSessionCookie(sessionToken, expiresAt);
                break;
            } catch (error) {
                if (!isUniqueViolation(error)) throw error;
                console.warn('Token conflict, retrying...');
            }
        }
        if (!sessionToken) {
            return { error: 'セッション作成に失敗しました' };
        }

        await recordAuditLog({
            actorId: userId,
            action: 'login',
            targetType: 'user',
            targetId: String(userId),
        });
    } catch (error) {
        console.error('[passkey] Registration + login error:', error);
        return { error: '認証中にエラーが発生しました' };
    }

    return { error: null };
}