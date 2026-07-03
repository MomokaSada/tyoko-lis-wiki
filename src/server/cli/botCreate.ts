/**
 * botcreate — Bot ユーザー作成 CLI
 *
 * アカウント作成セッションを消費して bot ユーザーを作成し、
 * 同時に API 認証用のトークンを発行する。
 *
 * 使い方:
 *   bun run src/server/cli/botcreate.ts <name> <password> <session-uuid>
 *
 * 例:
 *   bun run src/server/cli/botcreate.ts my-bot my-password 123e4567-e89b-12d3-a456-426614174000
 *
 * 終了コード:
 *   0 — 成功
 *   1 — 失敗（エラーメッセージが表示される）
 */

import { createBotUser, BotUserError } from '@/server/services/botUserService';

async function main() {
    const [, , name, password, sessionUuid] = process.argv;

    if (!name || !password || !sessionUuid) {
        console.error(
            '使い方: bun run src/server/cli/botcreate.ts <name> <password> <session-uuid>',
        );
        process.exit(1);
    }

    try {
        const result = await createBotUser(name, password, sessionUuid);

        console.log(`\n✓ bot ユーザーを作成しました`);
        console.log(`  ID:      ${result.user.id}`);
        console.log(`  名前:    ${result.user.name}`);
        console.log(`  種別:    ${result.user.type}`);
        console.log(`\n🔑 API トークン (この値は二度と表示されません):`);
        console.log(`  ${result.rawToken}`);
        console.log(`\n⚠  Bot 側の .env の APP_API_BOT_TOKEN に上記を設定してください`);

        process.exit(0);
    } catch (err) {
        if (err instanceof BotUserError) {
            console.error(`エラー: ${err.message}`);
        } else {
            console.error('エラー: 予期しない問題が発生しました', err);
        }
        process.exit(1);
    }
}

main();
