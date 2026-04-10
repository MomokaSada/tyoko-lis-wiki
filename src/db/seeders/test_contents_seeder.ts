import dotenv from 'dotenv';
import path from 'path';

// .env.local を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 動的 import で DB 接続
const { db } = await import('../index');
const { contents, categories, tags, contentCategories, contentTags } = await import('../schema');
const { eq } = await import('drizzle-orm');

async function seed() {
  console.log('🌱 記事シーディングを開始します...');

  // 1. カテゴリー "seed" の作成（存在しない場合）
  let categoryId: number;
  const existingCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.name, 'seed'))
    .limit(1);

  if (existingCategory.length > 0) {
    categoryId = existingCategory[0].id;
    console.log(`  ⏭️  カテゴリー "seed" は既に存在します (id: ${categoryId})`);
  } else {
    const [newCategory] = await db
      .insert(categories)
      .values({ name: 'seed' })
      .returning({ id: categories.id });
    categoryId = newCategory.id;
    console.log(`  ✅ カテゴリー "seed" を作成しました (id: ${categoryId})`);
  }

  // 2. タグ "seed" の作成（存在しない場合）
  let tagId: number;
  const existingTag = await db
    .select()
    .from(tags)
    .where(eq(tags.name, 'seed'))
    .limit(1);

  if (existingTag.length > 0) {
    tagId = existingTag[0].id;
    console.log(`  ⏭️  タグ "seed" は既に存在します (id: ${tagId})`);
  } else {
    const [newTag] = await db
      .insert(tags)
      .values({ name: 'seed' })
      .returning({ id: tags.id });
    tagId = newTag.id;
    console.log(`  ✅ タグ "seed" を作成しました (id: ${tagId})`);
  }

  // 3. テスト記事の作成 (5件)
  console.log('📝 記事を作成中...');
  for (let i = 1; i <= 5; i++) {
    const slug = `seed-article-${Date.now()}-${i}`;
    const title = `シード記事 ${i}`;
    const content = `これはシードスクリプトによって自動生成されたテスト記事 ${i} です。\n本文の内容は自由とのことですので、何らかのダミーテキストを挿入しています。`;

    const [newContent] = await db
      .insert(contents)
      .values({
        slug,
        currentTitle: title,
        currentContent: content,
        isPublished: true,
      })
      .returning({ id: contents.id });

    // 4. カテゴリーとタグの紐付け
    await db.insert(contentCategories).values({
      contentId: newContent.id,
      categoryId,
    });

    await db.insert(contentTags).values({
      contentId: newContent.id,
      tagId,
    });

    console.log(`  ✅ 記事作成完了: ${title} (slug: ${slug})`);
  }

  console.log('🎉 シーディングが完了しました！');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ シーダー実行エラー:', err);
  process.exit(1);
});
