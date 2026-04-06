import {
  createCategory,
  createTag,
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

function buildCategoryLabel(
  categoryId: number,
  categories: Array<{ id: number; name: string; parentId: number | null }>,
  seen = new Set<number>(),
): string {
  if (seen.has(categoryId)) {
    return '[循環]';
  }

  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    return '';
  }

  if (category.parentId === null) {
    return category.name;
  }

  seen.add(categoryId);
  const parentLabel = buildCategoryLabel(category.parentId, categories, seen);
  seen.delete(categoryId);

  return parentLabel ? `${parentLabel} > ${category.name}` : category.name;
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
