import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  categories,
  contentCategories,
  contentTags,
  tags,
} from '@/db/schema';

export async function listTags() {
  return db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(tags)
    .orderBy(asc(tags.name));
}

export async function listCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      parentId: categories.parentId,
    })
    .from(categories)
    .orderBy(asc(categories.name));
}

export async function findTagsByNames(names: string[]) {
  if (names.length === 0) {
    return [];
  }

  return db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(tags)
    .where(inArray(tags.name, names));
}

export async function createTag(name: string) {
  const [created] = await db
    .insert(tags)
    .values({ name })
    .returning({
      id: tags.id,
      name: tags.name,
    });

  return created;
}

export async function findCategoryByName(name: string) {
  const [category] = await db
    .select({
      id: categories.id,
      name: categories.name,
      parentId: categories.parentId,
    })
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1);

  return category ?? null;
}

export async function createCategory(data: {
  name: string;
  parentId: number | null;
}) {
  const [created] = await db
    .insert(categories)
    .values({
      name: data.name,
      parentId: data.parentId,
    })
    .returning({
      id: categories.id,
      name: categories.name,
      parentId: categories.parentId,
    });

  return created;
}

export async function updateCategory(data: {
  id: number;
  name: string;
  parentId: number | null;
}) {
  const [updated] = await db
    .update(categories)
    .set({
      name: data.name,
      parentId: data.parentId,
    })
    .where(eq(categories.id, data.id))
    .returning({
      id: categories.id,
      name: categories.name,
      parentId: categories.parentId,
    });

  return updated ?? null;
}

export async function listContentTagIds(contentId: number) {
  const rows = await db
    .select({
      tagId: contentTags.tagId,
    })
    .from(contentTags)
    .where(eq(contentTags.contentId, contentId));

  return rows.map((row) => row.tagId);
}

export async function deleteCategory(id: number) {
  // 子カテゴリを削除対象の親から切り離す（トップレベルに昇格）
  await db
    .update(categories)
    .set({ parentId: null })
    .where(eq(categories.parentId, id));

  // カテゴリ自体を削除（junction テーブルは FK cascade で削除される）
  await db
    .delete(categories)
    .where(eq(categories.id, id));
}

export async function listContentCategoryIds(contentId: number) {
  const rows = await db
    .select({
      categoryId: contentCategories.categoryId,
    })
    .from(contentCategories)
    .where(eq(contentCategories.contentId, contentId));

  return rows.map((row) => row.categoryId);
}
