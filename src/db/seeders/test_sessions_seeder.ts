import dotenv from 'dotenv';
import path from 'path';

// .env.local を明示的に読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ---------- メイン処理 ----------
async function seedSessions() {
  console.log('🌱 テスト用セッション（招待トークン）のシーディングを開始します...');

  const { db } = await import('../index');
  const { users, editSessions, accountCreateSessions } = await import('../schema');
  const { sql, eq } = await import('drizzle-orm');

  // 発行者となる admin ユーザーを取得
  const admins = await db
    .select()
    .from(users)
    .where(eq(users.name, 'admin'))
    .limit(1);

  if (admins.length === 0) {
    console.error('❌ admin ユーザーが見つかりません。先に test_users_seeder.ts を実行してください。');
    process.exit(1);
  }
  const adminId = admins[0].id;

  const EDIT_SESSION_UUID = '00000000-0000-4000-8000-000000000001';
  const ACCOUNT_SESSION_UUID = '00000000-0000-4000-8000-000000000002';

  // 1年後の有効期限を設定
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  try {
    // ---- 1. edit_sessions の生成 (項目投稿用) ----
    console.log('\n📝 項目作成用招待トークンを処理中...');

    // 既存セッションがあれば削除して再作成（冪等性）
    await db.delete(editSessions).where(eq(editSessions.uuid, EDIT_SESSION_UUID));

    await db.insert(editSessions).values({
      uuid: EDIT_SESSION_UUID,
      authorId: adminId,
      maxEdits: 50,
      editsUsed: 0,
      isActive: true,
      endAt: oneYearLater,
    });
    console.log(`  ✅ edit_sessions にテストトークンを作成しました`);

    // ---- 2. account_create_sessions の生成 (ユーザー登録用) ----
    console.log('\n👤 ユーザー登録用招待トークンを処理中...');

    await db.delete(accountCreateSessions).where(eq(accountCreateSessions.uuid, ACCOUNT_SESSION_UUID));

    await db.insert(accountCreateSessions).values({
      uuid: ACCOUNT_SESSION_UUID,
      authorId: adminId,
      isActive: true,
      endAt: oneYearLater,
    });
    console.log(`  ✅ account_create_sessions にテストトークンを作成しました`);

    console.log('\n🎉 シーディング完了！ 以下のURLにブラウザ（未ログイン状態のシークレットウィンドウ等）でアクセスしてテストできます。');
    console.log('--------------------------------------------------');
    console.log('▶️ 【未ログイン項目作成テスト】:');
    console.log(`    http://localhost:3000/posts/create?session=${EDIT_SESSION_UUID}`);
    console.log('');
    console.log('▶️ 【ユーザー登録招待テスト】:');
    console.log(`    http://localhost:3000/auth/register?session=${ACCOUNT_SESSION_UUID}`);
    console.log('--------------------------------------------------\n');

  } catch (error) {
    console.error('❌ セッション生成中にエラーが発生しました:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedSessions().catch((err) => {
  console.error('❌ 予期しないエラー:', err);
  process.exit(1);
});
