import type { BanAccountInput } from '@/server/schemas';
import {
    activateUserById,
    deactivateUserById,
} from '@/server/repositories/accountBanRepository';
import {
    findUserById,
    listManageableAccounts,
    listManageableAccountsPaginated,
} from '@/server/repositories/userRepository';

import type { Actor } from '@/types/actor';
import type { ListQuery, ListResult } from '@/types/listQuery';
import {
    commonErrors,
    serviceErrors,
} from '@/server/errors';

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
      error: commonErrors.accountBan.banPermissionDenied,
    };
  }

  if (actor.id === input.userId) {
    return {
      success: false as const,
      error: serviceErrors.accountBan.selfBanNotAllowed,
    };
  }

  const user = await findUserById(input.userId);
  if (!user) {
    return {
      success: false as const,
      error: serviceErrors.accountBan.userNotFound,
    };
  }

  if (!user.isActive) {
    return {
      success: false as const,
      error: serviceErrors.accountBan.alreadyBanned,
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
      error: commonErrors.accountBan.unbanPermissionDenied,
    };
  }

  const user = await findUserById(input.userId);
  if (!user) {
    return {
      success: false as const,
      error: serviceErrors.accountBan.userNotFound,
    };
  }

  if (user.isActive) {
    return {
      success: false as const,
      error: serviceErrors.accountBan.notBanned,
    };
  }

  const updated = await activateUserById(input.userId);

  return {
    success: true as const,
    data: updated!,
  };
}
