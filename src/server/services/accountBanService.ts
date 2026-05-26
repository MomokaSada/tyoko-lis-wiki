import type { BanAccountInput } from '@/server/schemas/accountBanSchemas';
import {
  activateUserById,
  deactivateUserById,
  findUserById,
  listManageableAccounts,
  listManageableAccountsPaginated,
} from '@/server/repositories/accountBanRepository';
import type { Actor } from '@/types/actor';
import type { ListQuery, ListResult } from '@/types/listQuery';

export async function getManageableAccounts(
  actor: Actor,
  query?: ListQuery<'name' | 'createdAt' | 'isActive'>,
): Promise<ListResult<{
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
}>> {
  if (actor.role !== 'owner') {
    return { items: [], totalCount: 0 };
  }

  if (query) {
    return listManageableAccountsPaginated(query as ListQuery<'name' | 'createdAt' | 'isActive'>);
  }

  const rows = await listManageableAccounts();
  return { items: rows, totalCount: rows.length };
}

export async function banAccount(actor: Actor, input: BanAccountInput) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: 'アカウントBAN権限がありません',
    };
  }

  if (actor.id === input.userId) {
    return {
      success: false as const,
      error: '自分自身はBANできません',
    };
  }

  const user = await findUserById(input.userId);
  if (!user) {
    return {
      success: false as const,
      error: '対象ユーザーが見つかりません',
    };
  }

  if (!user.isActive) {
    return {
      success: false as const,
      error: 'このアカウントは既にBANされています',
    };
  }

  const updated = await deactivateUserById(input.userId);

  return {
    success: true as const,
    data: updated!,
  };
}
export async function unbanAccount(actor: Actor, input: BanAccountInput) {
  if (actor.role !== 'owner') {
    return {
      success: false as const,
      error: 'アカウントBAN解除権限がありません',
    };
  }

  const updated = await activateUserById(input.userId);

  if (!updated) {
    return {
      success: false as const,
      error: '対象ユーザーが見つかりません',
    };
  }

  return {
    success: true as const,
    data: updated,
  };
}
