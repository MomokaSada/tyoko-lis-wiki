/**
 * botUserService — Bot ユーザー作成
 *
 * アカウント作成セッションを消費して bot ユーザーを作成し、
 * API 認証用トークンを発行する。
 * CLI / 管理画面 の両方から使えるようにビジネスロジックを分離。
 */

import { randomBytes, createHash } from 'node:crypto';
import {
    findActiveAccountCreateSession,
    deactivateAccountCreateSession,
} from '@/server/repositories/accountCreateLinkRepository';
import { createInvitedUser, findUserByName } from '@/server/repositories/authRepository';
import { hashPassword } from '@/server/services/modules/password';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildDummyEmail, normalizeUsername } from '@/server/lib/dummyEmail';
import { isUniqueViolation } from '@/server/lib/pgError';
import { setBotTokenHash } from '@/server/repositories/userRepository';

export interface CreateBotUserResult {
    user: {
        id: number;
        name: string;
        type: string;
    };
    rawToken: string;
}

export class BotUserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BotUserError';
    }
}

/**
 * Bot ユーザーを作成し、API トークンを発行する。
 *
 * @param name         bot ユーザー名
 * @param password     ログインパスワード
 * @param sessionUuid  アカウント作成セッションの UUID
 * @returns            CreateBotUserResult（rawToken は二度と取得不可）
 * @throws BotUserError バリデーション / セッション / 重複エラー
 */
export async function createBotUser(
    name: string,
    password: string,
    sessionUuid: string,
): Promise<CreateBotUserResult> {
    const normalizedName = normalizeUsername(name);

    // ── 1. セッション検証 ──
    const session = await findActiveAccountCreateSession(sessionUuid);
    if (!session) {
        throw new BotUserError('アカウント作成セッションが無効か期限切れです');
    }

    // ── 2. 名前の重複チェック ──
    const existing = await findUserByName(normalizedName);
    if (existing) {
        throw new BotUserError(`ユーザー名 "${normalizedName}" は既に使用されています`);
    }

    // ── 3. Supabase Auth ユーザー作成 ──
    const supabaseAdmin = createAdminClient();
    const dummyEmail = buildDummyEmail(normalizedName);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        password,
        email_confirm: true,
        app_metadata: { role: 'bot' },
    });

    if (error || !data.user) {
        throw new BotUserError(
            `Supabase Auth ユーザー作成に失敗しました — ${error?.message ?? '不明なエラー'}`,
        );
    }

    // ── 4. API トークン生成 ──
    const rawToken = `bot_${randomBytes(32).toString('hex')}`;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    // ── 5. DB 登録 ──
    try {
        const user = await createInvitedUser({
            sessionId: sessionUuid,
            authUserId: data.user.id,
            userName: normalizedName,
            passwordHash: await hashPassword(password),
            type: 'bot',
        });

        // bot_token_hash を設定
        await setBotTokenHash(user.id, tokenHash);

        // セッション消費
        await deactivateAccountCreateSession(sessionUuid);

        return {
            user: { id: user.id, name: user.name, type: user.type },
            rawToken,
        };
    } catch (dbError) {
        // DB 登録に失敗 → Supabase Auth ユーザーを削除してロールバック
        await supabaseAdmin.auth.admin.deleteUser(data.user.id).catch(() => {});

        if (isUniqueViolation(dbError)) {
            throw new BotUserError(`ユーザー名 "${normalizedName}" は既に使用されています`);
        }
        throw dbError;
    }
}
