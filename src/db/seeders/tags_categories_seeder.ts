import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// .env.local を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 動的 import で DB 接続
const { db } = await import('../index');
const { tags, categories } = await import('../schema');
const { inArray } = await import('drizzle-orm');

// ===== 設定 =====
const TAG_COUNT = 50;
const CATEGORY_COUNT = 50;

/**
 * 指定文字数分のランダムな16進数ハッシュ文字列を生成する
 */
function generateHash(length = 6): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * タグを一括作成する
 */
async function seedTags() {
  console.log(`🏷️  タグを ${TAG_COUNT} 件作成します...`);

  const hash = generateHash();
  const names: string[] = [];

  for (let i = 1; i <= TAG_COUNT; i++) {
    names.push(`tag-${hash}-${i}`);
  }

  // 既存タグと重複しないものだけを挿入
  const existing = await db
    .select({ name: tags.name })
    .from(tags)
    .where(inArray(tags.name, names));

  const existingNames = new Set(existing.map((t) => t.name));
  let createdCount = 0;
  let skippedCount = 0;

  for (const name of names) {
    if (existingNames.has(name)) {
      skippedCount++;
      continue;
    }
    await db.insert(tags).values({ name });
    createdCount++;
  }

  console.log(`  ✅ タグ: ${createdCount} 件作成 / ${skippedCount} 件スキップ`);
}

/**
 * カテゴリーを一括作成する
 */
async function seedCategories() {
  console.log(`📂 カテゴリーを ${CATEGORY_COUNT} 件作成します...`);

  const hash = generateHash();
  const names: string[] = [];

  for (let i = 1; i <= CATEGORY_COUNT; i++) {
    names.push(`category-${hash}-${i}`);
  }

  // 既存カテゴリーと重複しないものだけを挿入
  const existing = await db
    .select({ name: categories.name })
    .from(categories)
    .where(inArray(categories.name, names));

  const existingNames = new Set(existing.map((c) => c.name));
  let createdCount = 0;
  let skippedCount = 0;

  for (const name of names) {
    if (existingNames.has(name)) {
      skippedCount++;
      continue;
    }
    await db.insert(categories).values({ name });
    createdCount++;
  }

  console.log(`  ✅ カテゴリー: ${createdCount} 件作成 / ${skippedCount} 件スキップ`);
}

async function seed() {
  console.log('🌱 タグ・カテゴリー一括シーディングを開始します...');

  await seedTags();
  await seedCategories();

  console.log('🎉 シーディングが完了しました！');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ シーダー実行エラー:', err);
  process.exit(1);
});
