import type { BanAccountInput } from '@/server/schemas/accountBanSchemas';
import {
  activateUserById,
  deactivateUserById,
  listManageableAccounts,
} from '@/server/repositories/accountBanRepository';

type Actor = {
  id: number;
  role: 'owner' | 'admin' | 'bot';
};

export async function getManageableAccounts(actor: Actor) {
  if (actor.role !== 'owner') {
    return [];
  }

  return listManageableAccounts();
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

  const updated = await deactivateUserById(input.userId);

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
