import type { BanAccountInput } from '@/server/schemas';
import {
    activateUserById,
    deactivateUserById,
    listManageableAccounts,
    listManageableAccountsPaginated,
} from '@/server/repositories/accountBanRepository';
import {
    findUserById,
    findUserByAuthUserId,
    getUserProfile,
} from '@/server/repositories/userRepository';
import { getValidSessionByToken } from '@/server/repositories/appSessionRepository';

import type { Actor } from '@/types/actor';
import type { ListQuery, ListResult } from '@/types/listQuery';
import {
    commonErrors,
    serviceErrors,
} from '@/server/errors';
import { logger } from '@/server/lib/logger';

/**
 * 現在のリクエストのアカウントが BAN されているかを判定する。
 * Server Component のゲートから使用することを想定。
 *
 * @param supabaseUserId - Supabase Auth のユーザーID（未ログイン時は null）
 * @param appSessionToken - パスキーセッショントークン（未ログイン時は null）
 */
export async function isCurrentAccountBanned(
  supabaseUserId: string | null | undefined,
  appSessionToken: string | null | undefined,
): Promise<boolean> {
  try {
    if (supabaseUserId) {
      const appUser = await findUserByAuthUserId(supabaseUserId);
      if (appUser && !appUser.isActive) return true;
    }
    if (appSessionToken) {
      const session = await getValidSessionByToken(appSessionToken);
      if (session) {
        const appUser = await getUserProfile(session.userId);
        if (appUser && !appUser.isActive) return true;
      }
    }
  } catch (error) {
    logger.error('[accountBanService] isCurrentAccountBanned エラー:', error);
    // エラー時は安全側に倒さず BAN 状態とみなさない（→ ゲート側で fail-closed にするかは呼び出し元に委ねる）
  }
  return false;
}

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
