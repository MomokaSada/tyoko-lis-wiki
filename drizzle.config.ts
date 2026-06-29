import { defineConfig } from 'drizzle-kit';

// drizzle-kit は .env ファイルを自動ロードしない。
// generate は DB 接続不要なので url が undefined でも動くが、migrate / push / studio は
// DB 接続が必須で undefined だと即落ちる。
// Node.js 20.6+ の組み込み process.loadEnvFile で .env.local を明示ロードする
//（dotenv のインストール不要）。
process.loadEnvFile('.env.local');

if (!process.env.DATABASE_URL) {
    throw new Error(
        'DATABASE_URL が .env.local に見つかりません。' +
            'drizzle-kit は .env を自動ロードしないので、drizzle.config.ts での明示ロードが必要。',
    );
}

export default defineConfig({
    schema: './src/db/schema',
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
