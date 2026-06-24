'use client';

import {
    startRegistration,
    startAuthentication,
} from "@simplewebauthn/browser";
import type {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

export async function registerPasskey(): Promise<{
    error?: string
}> {
    const { 
        startPasskeyRegistrationAction,
        finishPasskeyRegistrationAction
    } = await import('@/server/actions/passkeyActions');
    const startResult = await startPasskeyRegistrationAction();

    if (startResult.error) return { error: startResult.error };
    if (!startResult.options) return { error: '登録オプションの生成に失敗しました' };
    if (!startResult.challengeId) return { error: 'チャレンジ情報の生成に失敗しました' };

    let regResponse;
    try {
        regResponse = await startRegistration({
            optionsJSON: startResult.options as PublicKeyCredentialCreationOptionsJSON,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : '不明なエラー';
        return {
            error: `パスキーの作成に失敗しました: ${message}`
        };
    }

    const formData = new FormData();

    formData.append(
        'credential',
        JSON.stringify(regResponse)
    );

    formData.append(
        'challengeId',
        String(startResult.challengeId)
    );

    const finishResult = await finishPasskeyRegistrationAction(
        {
            error: null
        },
        formData
    );

    if (finishResult.error) return {
        error: finishResult.error
    }
    return {}
}

/**
 * パスキーでログインする。
 * @param userName - 省略可。指定するとそのユーザーのパスキーのみ対象。
 *                   省略するとデバイス上の全パスキーから選択（Discoverable Credential）。
 */

export async function loginWithPasskey(
    userName?: string
): Promise<{
    error?: string
}> {
    const { 
        startPasskeyLoginAction,
        finishPasskeyLoginAction
    } = await import(
        '@/server/actions/passkeyActions'
    );

    const formData = new FormData();
    if (userName) formData.append(
        'userName', userName
    );

    const startResult = await startPasskeyLoginAction(
        {
            error: null
        },
        formData
    );
    if (startResult.error) return {
        error: startResult.error
    };
    if (!startResult.options) return {
        error: '認証オプションの生成に失敗しました'
    };
    if (!startResult.challengeId) return {
        error: 'チャレンジ情報の生成に失敗しました'
    };

    let authResponse;
    try {
        authResponse = await startAuthentication({
            optionsJSON: startResult.options as PublicKeyCredentialRequestOptionsJSON,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : '不明なエラー';
        return {
            error: `パスキー認証に失敗しました: ${message}`
        };
    }

    const completeFormData = new FormData();
    completeFormData.append(
        'credential', JSON.stringify(authResponse)
    );
    completeFormData.append(
        'challengeId', JSON.stringify(startResult.challengeId)
    );

    const finishResult = await finishPasskeyLoginAction(
        {
            error: null
        },
        completeFormData,
    );

    if (finishResult.error) return {
        error: finishResult.error
    };

    return {};
}

/**
 * ユーザー名 + パスワードで認証し、そのままパスキーを登録する（方式E）。
 *
 * 内部で loginAndStartPasskeyRegistrationAction → startRegistration
 * → finishPasskeyLoginAndRegistrationAction を直列に実行する。
 *
 * 重要な違い: セッションは finishPasskeyLoginAndRegistrationAction の中で
 * パスキー保存 ＜後に＞ 作成される。そのためパスキー作成に失敗した場合は
 * セッションが一切作られず、ログアウト処理が不要。
 */
export async function loginAndRegisterPasskey(
    userName: string,
    password: string,
): Promise<{ error?: string }> {
    const {
        loginAndStartPasskeyRegistrationAction,
        finishPasskeyLoginAndRegistrationAction,
    } = await import('@/server/actions/passkeyActions');

    // Step 1: 認証検証 + 登録 options 取得（セッションは作成しない）
    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('password', password);

    const startResult = await loginAndStartPasskeyRegistrationAction(
        { error: null },
        formData,
    );
    if (startResult.error) return { error: startResult.error };
    if (!startResult.options) return { error: '登録オプションの生成に失敗しました' };
    if (!startResult.challengeId) return { error: 'チャレンジ情報の生成に失敗しました' };

    // Step 2: ブラウザでパスキー作成
    let regResponse;
    try {
        regResponse = await startRegistration({
            optionsJSON: startResult.options as PublicKeyCredentialCreationOptionsJSON,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : '不明なエラー';
        return { error: `パスキーの作成に失敗しました: ${message}` };
    }

    // Step 3: パスキー保存 + セッション作成（パスキー保存が成功してから signIn）
    const finishForm = new FormData();
    finishForm.append('credential', JSON.stringify(regResponse));
    finishForm.append('challengeId', String(startResult.challengeId));
    finishForm.append('userName', userName);
    finishForm.append('password', password);

    const finishResult = await finishPasskeyLoginAndRegistrationAction(
        { error: null },
        finishForm,
    );
    if (finishResult.error) {
        return { error: `パスキーの登録に失敗しました: ${finishResult.error}` };
    }

    return {};
}