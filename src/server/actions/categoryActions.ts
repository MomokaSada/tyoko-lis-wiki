'use server';

import { revalidatePath } from 'next/cache';
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from '@/server/schemas/categorySchemas';
import { createCategoryAsAdmin, deleteCategoryAsAdmin, updateCategoryAsAdmin } from '@/server/services/taxonomyService';
import { recordAuditLog } from '@/server/services/auditLogService';
import { withAction, requireActor, parseOrError } from '@/server/lib/withAction';
import type { BaseActionState } from '@/types/actionState';

export type CategoryActionState = BaseActionState & {
  success: string | null;
};

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const preflight = await withAction({ rateLimit: 'createCategory' });
  if (preflight) return { ...preflight, success: null };

  const parsed = parseOrError(createCategorySchema, {
    name: formData.get('name'),
    parentId: formData.get('parentId'),
  });
  if ('error' in parsed) return { ...parsed, success: null };

  const actor = await requireActor();
  if ('error' in actor) return { error: 'カテゴリ管理権限がありません', success: null };

  const result = await createCategoryAsAdmin(actor, parsed.parsed);
  if (!result.success) {
    return { error: result.error, success: null };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: 'create_category',
    targetId: String(result.data.id),
    targetType: 'category',
    detail: {
      name: result.data.name,
      parentId: result.data.parentId,
    },
  });

  revalidatePath('/admin/categories');

  return {
    error: null,
    success: `カテゴリ「${result.data.name}」を作成しました`,
  };
}

export async function updateCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const preflight = await withAction({ rateLimit: 'updateCategory' });
  if (preflight) return { ...preflight, success: null };

  const parsed = parseOrError(updateCategorySchema, {
    id: formData.get('id'),
    name: formData.get('name'),
    parentId: formData.get('parentId'),
  });
  if ('error' in parsed) return { ...parsed, success: null };

  const actor = await requireActor();
  if ('error' in actor) return { error: 'カテゴリ管理権限がありません', success: null };

  const result = await updateCategoryAsAdmin(actor, parsed.parsed);
  if (!result.success) {
    return { error: result.error, success: null };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: 'update_category',
    targetId: String(result.data.id),
    targetType: 'category',
    detail: {
      name: result.data.name,
      parentId: result.data.parentId,
    },
  });

  revalidatePath('/admin/categories');

  return {
    error: null,
    success: `カテゴリ「${result.data.name}」を更新しました`,
  };
}

export async function deleteCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const preflight = await withAction({ rateLimit: 'deleteCategory' });
  if (preflight) return { ...preflight, success: null };

  const parsed = parseOrError(deleteCategorySchema, {
    id: formData.get('id'),
  });
  if ('error' in parsed) return { ...parsed, success: null };

  const actor = await requireActor();
  if ('error' in actor) return { error: 'カテゴリ管理権限がありません', success: null };

  const result = await deleteCategoryAsAdmin(actor, parsed.parsed.id);
  if (!result.success) {
    return { error: result.error, success: null };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: 'delete_category',
    targetId: String(parsed.parsed.id),
    targetType: 'category',
  });

  revalidatePath('/admin/categories');

  return {
    error: null,
    success: 'カテゴリを削除しました',
  };
}
