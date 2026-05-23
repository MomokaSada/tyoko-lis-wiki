'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from '@/server/schemas/categorySchemas';
import { createCategoryAsAdmin, deleteCategoryAsAdmin, updateCategoryAsAdmin } from '@/server/services/taxonomyService';
import { BaseActionState } from '@/types/actionState';
import { checkRateLimit } from '@/server/services/rateLimitService';
import { recordCurrentRequestDevice } from '@/server/services/deviceService';
import { recordAuditLog } from '@/server/services/auditLogService';

export type CategoryActionState = BaseActionState & {
  success: string | null;
};

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('createCategory');
  if (!rateLimitResult.allowed) {
    return {
      error: 'カテゴリ作成試行が多すぎます。しばらくしてから再度お試しください。',
      success: null,
    };
  }

  const parsed = createCategorySchema.safeParse({
    name: formData.get('name'),
    parentId: formData.get('parentId'),
  });

  if (!parsed.success) {
    return { error: getFirstZodErrorMessage(parsed.error), success: null };
  }

  const actor = await getCurrentActor();
  if (!actor) {
    return { error: 'カテゴリ管理権限がありません', success: null };
  }

  const result = await createCategoryAsAdmin(actor, parsed.data);
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
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('updateCategory');
  if (!rateLimitResult.allowed) {
    return {
      error: 'カテゴリ更新試行が多すぎます。しばらくしてから再度お試しください。',
      success: null,
    };
  }

  const parsed = updateCategorySchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    parentId: formData.get('parentId'),
  });

  if (!parsed.success) {
    return { error: getFirstZodErrorMessage(parsed.error), success: null };
  }

  const actor = await getCurrentActor();
  if (!actor) {
    return { error: 'カテゴリ管理権限がありません', success: null };
  }

  const result = await updateCategoryAsAdmin(actor, parsed.data);
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
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('deleteCategory');
  if (!rateLimitResult.allowed) {
    return {
      error: 'カテゴリ削除試行が多すぎます。しばらくしてから再度お試しください。',
      success: null,
    };
  }

  const parsed = deleteCategorySchema.safeParse({
    id: formData.get('id'),
  });

  if (!parsed.success) {
    return { error: getFirstZodErrorMessage(parsed.error), success: null };
  }

  const actor = await getCurrentActor();
  if (!actor) {
    return { error: 'カテゴリ管理権限がありません', success: null };
  }

  const result = await deleteCategoryAsAdmin(actor, parsed.data.id);
  if (!result.success) {
    return { error: result.error, success: null };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: 'delete_category',
    targetId: String(parsed.data.id),
    targetType: 'category',
  });

  revalidatePath('/admin/categories');

  return {
    error: null,
    success: `カテゴリを削除しました`,
  };
}
