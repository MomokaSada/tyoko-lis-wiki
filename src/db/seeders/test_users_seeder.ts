import dotenv from 'dotenv';
import path from 'path';

// .env.local を明示的に読み込む（import hoisting より先に実行させるため動的import前に配置）
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Proxy テスト用ユーザーシーダー
 *
 * Supabase Auth (auth.users) に 3 種類のテストユーザーを作成し、
 * 必要に応じて public.users にも対応レコードを挿入する。
 *
 * 実行: bun run src/db/seeders/test_users_seeder.ts
 * パスワード: すべて password123
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が不足しています: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 動的 import で DB 接続（env が設定済みの状態で読み込む）
const { createClient } = await import('@supabase/supabase-js');
const { db } = await import('../index');
const { users } = await import('../schema');
const { sql } = await import('drizzle-orm');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------- テストユーザー定義 ----------

interface TestUser {
  userName: string;
  password: string;
  role?: 'admin' | 'owner';
  /** public.users に同期する際のレコード情報 */
  publicUser?: {
    type: 'admin' | 'owner' | 'bot';
  };
}

const TEST_USERS: TestUser[] = [
  {
    userName: 'admin',
    password: 'password123',
    role: 'admin',
    publicUser: { type: 'admin' },
  },
  {
    userName: 'owner',
    password: 'password123',
    role: 'owner',
    publicUser: { type: 'owner' },
  },
  {
    userName: 'user',
    password: 'password123',
    // role なし — 一般ユーザー
    // public.users の user_type enum に 'user' が存在しないため同期しない
  },
];

// ---------- メイン処理 ----------

async function seed() {
  console.log('🌱 テストユーザーのシーディングを開始します...');
  console.log(`   Supabase URL: ${SUPABASE_URL}\n`);

  // 全ユーザーを1回だけ取得してキャッシュ（ループ内で毎回取得しない）
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingAuthUsers = listData?.users ?? [];

  for (const tu of TEST_USERS) {
    const dummyEmail = `${tu.userName}@test.com`;
    // ---- 1. auth.users への upsert (既存ならスキップ) ----
    console.log(`📧 ${tu.userName} を処理中...`);

    const existing = existingAuthUsers.find((u) => u.email === dummyEmail) ?? null;

    if (existing) {
      console.log(`  ⏭️  auth.users に既に存在 — メタデータを更新します`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: tu.password,
        app_metadata: tu.role ? { role: tu.role } : {},
      });
      if (updateError) {
        console.error(`  ❌ auth.users 更新エラー: ${updateError.message}`);
      } else {
        console.log(`  ✅ auth.users のメタデータを更新しました (id: ${existing.id})`);
      }
    } else {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: dummyEmail,
        password: tu.password,
        email_confirm: true,
        app_metadata: tu.role ? { role: tu.role } : {},
      });

      if (createError) {
        console.error(`  ❌ auth.users 作成エラー: ${createError.message}`);
      } else {
        console.log(`  ✅ auth.users に作成しました (id: ${created.user.id})`);
      }
    }

    // ---- 2. public.users への同期 ----
    if (tu.publicUser) {
      // 既存レコードの確認
      const existing = await db
        .select()
        .from(users)
        .where(sql`${users.name} = ${tu.userName}`)
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⏭️  public.users に "${tu.userName}" は既に存在`);
      } else {
        const hashedPassword = await Bun.password.hash(tu.password);

        await db.insert(users).values({
          accountCreateSessionId: null,
          name: tu.userName,
          password: hashedPassword,
          type: tu.publicUser.type,
          isActive: true,
        });
        console.log(`  ✅ public.users に "${tu.userName}" を挿入しました`);
      }
    }

    console.log('');
  }

  console.log('🎉 シーディング完了！');
  console.log('\nテストアカウント一覧:');
  console.log('┌──────────────┬──────────┬──────────────┐');
  console.log('│ ユーザー名   │ ロール   │ パスワード   │');
  console.log('├──────────────┼──────────┼──────────────┤');
  console.log('│ admin        │ admin    │ password123  │');
  console.log('│ owner        │ owner    │ password123  │');
  console.log('│ user         │ (なし)   │ password123  │');
  console.log('└──────────────┴──────────┴──────────────┘');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ シーダー実行エラー:', err);
  process.exit(1);
});
