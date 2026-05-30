import { defineConfig } from 'drizzle-kit';

// drizzle-kit は自動的に .env を読み込むため、dotenv の明示的な読み込みは不要。
// 必要に応じて --env-file .env.local フラグを drizzle-kit コマンドに追加する。

export default defineConfig({
    schema: './src/db/schema',
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
