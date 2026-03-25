import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// .env.local から環境変数を読み込む
dotenv.config({ path: '.env.local' });

export default defineConfig({
    schema: './src/db/schema',
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
