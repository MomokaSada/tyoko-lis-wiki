import {
  createCategory,
  createTag,
  deleteCategory as deleteCategoryFromRepo,
  findCategoryByName,
  findTagsByNames,
  listCategories,
  listContentCategoryIds,
  listContentTagIds,
  listTags,
  updateCategory,
} from '@/server/repositories/taxonomyRepository';
import type { PrivilegedActor as Actor } from '@/types/actor';

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function parseDelimitedNames(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,、]/)
        .map((item) => normalizeName(item))
        .filter(Boolean),
    ),
  );
}

function sortNumericIds(ids: number[]) {
  return [...new Set(ids)].sort((a, b) => a - b);
}

function sameIds(a: number[], b: number[]) {
  const left = sortNumericIds(a);
  const right = sortNumericIds(b);

  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function buildCategoryLabel(
  categoryId: number,
  allCategories: any[],
  depth = 0
): string {
  // 無限再帰防止 (最大10階層まで)
  if (depth > 10) return '...';

  const category = allCategories.find((c) => c.id === categoryId);
  if (!category) return 'Unknown';

  if (category.parentId) {
    const parentLabel = buildCategoryLabel(category.parentId, allCategories, depth + 1);
    return `${parentLabel} > ${category.name}`;
  }

  return category.name;
}

function wouldCreateCategoryCycle(
  allCategories: Array<{ id: number; name: string; parentId: number | null }>,
  categoryId: number,
  nextParentId: number | null,
) {
  let cursor = nextParentId;
  const seen = new Set<number>();

  while (cursor !== null) {
    if (cursor === categoryId) {
      return true;
    }

    if (seen.has(cursor)) {
      return true;
    }

    seen.add(cursor);
    const current = allCategories.find((item) => item.id === cursor);
    cursor = current?.parentId ?? null;
  }

  return false;
}

export async function getTaxonomyOptions() {
  const [tagRows, categoryRows] = await Promise.all([listTags(), listCategories()]);

  return {
    tags: tagRows,
    categories: categoryRows.map((category) => ({
      ...category,
      label: buildCategoryLabel(category.id, categoryRows),
    })),
  };
}

export async function resolveTaxonomySelection(input: {
  existingTagIds: number[];
  newTags: string;
  existingCategoryIds: number[];
  newCategoryName: string;
  newCategoryParentId: number | null;
}) {
  const tagNames = parseDelimitedNames(input.newTags);
  const existingTagRows = await findTagsByNames(tagNames);
  const existingTagsByName = new Map(existingTagRows.map((row) => [row.name, row.id]));
  const resolvedTagIds = [...input.existingTagIds];

  for (const tagName of tagNames) {
    const existingTagId = existingTagsByName.get(tagName);

    if (existingTagId) {
      resolvedTagIds.push(existingTagId);
      continue;
    }

    const createdTag = await createTag(tagName);
    resolvedTagIds.push(createdTag.id);
  }

  const resolvedCategoryIds = [...input.existingCategoryIds];
  const newCategoryName = normalizeName(input.newCategoryName);

  if (newCategoryName) {
    const existingCategory = await findCategoryByName(newCategoryName);

    if (existingCategory) {
      resolvedCategoryIds.push(existingCategory.id);
    } else {
      const createdCategory = await createCategory({
        name: newCategoryName,
        parentId: input.newCategoryParentId,
      });
      resolvedCategoryIds.push(createdCategory.id);
    }
  }

  return {
    tagIds: sortNumericIds(resolvedTagIds),
    categoryIds: sortNumericIds(resolvedCategoryIds),
  };
}

export async function getContentTaxonomyState(contentId: number) {
  const [tagIds, categoryIds] = await Promise.all([
    listContentTagIds(contentId),
    listContentCategoryIds(contentId),
  ]);

  return {
    tagIds: sortNumericIds(tagIds),
    categoryIds: sortNumericIds(categoryIds),
  };
}

export function detectTaxonomyChanges(
  current: { tagIds: number[]; categoryIds: number[] },
  next: { tagIds: number[]; categoryIds: number[] },
) {
  return {
    tagChanged: !sameIds(current.tagIds, next.tagIds),
    categoryChanged: !sameIds(current.categoryIds, next.categoryIds),
  };
}

/**
 * 項目に紐付く全てのタグとカテゴリの情報を取得します
 */
export async function getFullContentTaxonomy(contentId: number) {
  const [tagIds, categoryIds] = await Promise.all([
    listContentTagIds(contentId),
    listContentCategoryIds(contentId),
  ]);

  const [tagRows, categoryRows] = await Promise.all([
    listTags(),
    listCategories(),
  ]);

  const contentTags = tagRows.filter((t) => tagIds.includes(t.id));
  const contentCategories = categoryRows.filter((c) => categoryIds.includes(c.id));

  return {
    tags: contentTags,
    categories: contentCategories,
    allCategories: categoryRows, // 階層解決用
  };
}

/**
 * 特定のカテゴリからルートまでのパス（親子関係）を解決します
 */
export function resolveCategoryPath(
  categoryId: number,
  allCategories: Array<{ id: number; name: string; parentId: number | null }>
): Array<{ id: number; name: string }> {
  const path: Array<{ id: number; name: string }> = [];
  let currentId: number | null = categoryId;
  const seen = new Set<number>();

  while (currentId !== null && !seen.has(currentId)) {
    seen.add(currentId);
    const category = allCategories.find((c) => c.id === currentId);
    if (!category) break;
    path.unshift({ id: category.id, name: category.name });
    currentId = category.parentId;
  }

  return path;
}

export async function createCategoryAsAdmin(
  actor: Actor,
  input: { name: string; parentId: number | null },
) {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return { success: false as const, error: 'カテゴリ管理権限がありません' };
  }

  const name = normalizeName(input.name);
  if (!name) {
    return { success: false as const, error: 'カテゴリ名を入力してください' };
  }

  const existing = await findCategoryByName(name);
  if (existing) {
    return { success: false as const, error: 'そのカテゴリ名はすでに存在します' };
  }

  const created = await createCategory({
    name,
    parentId: input.parentId,
  });

  return { success: true as const, data: created };
}

export async function updateCategoryAsAdmin(
  actor: Actor,
  input: { id: number; name: string; parentId: number | null },
) {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return { success: false as const, error: 'カテゴリ管理権限がありません' };
  }

  const name = normalizeName(input.name);
  if (!name) {
    return { success: false as const, error: 'カテゴリ名を入力してください' };
  }

  if (input.parentId === input.id) {
    return { success: false as const, error: '自分自身を親カテゴリにはできません' };
  }

  const allCategories = await listCategories();
  if (wouldCreateCategoryCycle(allCategories, input.id, input.parentId)) {
    return { success: false as const, error: '親カテゴリの設定が循環しています' };
  }

  const nameConflict = allCategories.find(
    (category) => category.id !== input.id && category.name === name,
  );
  if (nameConflict) {
    return { success: false as const, error: 'そのカテゴリ名はすでに存在します' };
  }

  const updated = await updateCategory({
    id: input.id,
    name,
    parentId: input.parentId,
  });

  if (!updated) {
    return { success: false as const, error: '対象のカテゴリが見つかりません' };
  }

  return { success: true as const, data: updated };
}

export async function deleteCategoryAsAdmin(
  actor: Actor,
  id: number,
) {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return { success: false as const, error: 'カテゴリ管理権限がありません' };
  }

  await deleteCategoryFromRepo(id);

  return { success: true as const };
}
