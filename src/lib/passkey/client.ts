'use client';

import { startRegistration } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser";

export async function registerPasskey(): Promise<{
    error?: string
}> {
    const { startPasskeyRegistrationAction } = await import('@/server/actions/passkeyActions');
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

    const { finishPasskeyRegistrationAction } = await import(
        '@/server/actions/passkeyActions'
    );

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
