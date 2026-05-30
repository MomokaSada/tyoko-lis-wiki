import { asc, eq, inArray, ilike, desc, and, sql } from 'drizzle-orm';
import { escapeLikePattern } from './modules/escapeLike';
import { db } from '@/db';
import {
  categories,
  contentCategories,
  contentTags,
  tags,
} from '@/db/schema';
import type { ListQuery, ListResult } from '@/types/listQuery';

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

export async function listCategoriesPaginated(
  query?: ListQuery<'name'>,
): Promise<ListResult<{ id: number; name: string; parentId: number | null }>> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (query?.searchQuery) {
    const escaped = escapeLikePattern(query.searchQuery);
    conditions.push(ilike(categories.name, `%${escaped}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const orderByDir = query?.sortOrder === 'desc' ? desc : asc;

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      parentId: categories.parentId,
    })
    .from(categories)
    .where(where)
    .orderBy(orderByDir(categories.name))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories)
    .where(where);

  return {
    items: rows,
    totalCount: Number(countResult[0]?.count ?? 0),
  };
}

export async function findCategoryIdsBySearchQuery(searchQuery: string): Promise<number[]> {
  const escaped = escapeLikePattern(searchQuery);
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(ilike(categories.name, `%${escaped}%`));
  return rows.map((r) => r.id);
}

export async function deleteCategoryById(id: number) {
  return db.transaction(async (tx) => {
    // 先に子カテゴリの親を null に更新
    await tx
      .update(categories)
      .set({ parentId: null })
      .where(eq(categories.parentId, id));

    // カテゴリを削除
    const [deleted] = await tx
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    return deleted ?? null;
  });
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
