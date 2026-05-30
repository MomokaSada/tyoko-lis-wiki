import { randomUUID } from 'crypto';
import {
    deactivateAccountCreateSession,
    findAccountCreateSessions,
    findAccountCreateSessionsPaginated,
    insertAccountCreateSession,
} from '@/server/repositories/accountCreateLinkRepository';
import type { AccountCreateSessionRow, AccountStatusFilter } from '@/server/repositories/accountCreateLinkRepository';
import type {
    CreateAccountCreateLinkInput,
    DeactivateAccountCreateLinkInput,
} from '@/server/schemas/accountCreateLinkSchemas';
import type { Actor } from '@/types/actor';
import type { ListQuery, ListResult } from '@/types/listQuery';
import { isUniqueViolation } from '@/server/services/modules/pgError';

type CreateAccountCreateLinkResult = 
    | { 
        success: true;
        data: { 
            uuid: string; 
            url: string; 
            endAt: Date 
        } 
    }
    | { 
        success: false; 
        error: string 
    };

type AccountCreateLinkListItem = {
    uuid: string;
    authorId: number;
    authorName: string | null;
    isActive: boolean;
    startAt: Date;
    endAt: Date;
    createdAt: Date;
    status: 'active' | 'expired' | 'inactive';
};

export async function createAccountCreateLink(
    actor: Actor,
    input: CreateAccountCreateLinkInput
): Promise<CreateAccountCreateLinkResult> {
    if (actor.role !== 'owner') {
        return { 
            success: false, 
            error: 'Unauthorized' 
        };
    }
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + input.expiresInMinutes * 60 * 1000);

    for (let i = 0; i < 3; i++) {
        try {
            const uuid = randomUUID();
            await insertAccountCreateSession({
                uuid,
                authId: actor.id,
                startAt,
                endAt,
            });

            return { 
                success: true, 
                data: { 
                    uuid, 
                    url: `/auth/register?session=${uuid}`, 
                    endAt 
                },
            };
        } catch (error) {
            if (!isUniqueViolation(error)) {
                throw error;
            }

            console.warn('Account create session UUID conflict, retrying...');
        }
    }
    return { 
        success: false, 
        error: 'Failed to create account create link' 
    };
}

function enrichRow(
  row: AccountCreateSessionRow,
  now: Date,
): AccountCreateLinkListItem {
  return {
    ...row,
    status: !row.isActive
      ? 'inactive'
      : row.endAt <= now
        ? 'expired'
        : 'active',
  };
}

export async function getAccountCreateLinks(
  actor: Actor,
  query?: ListQuery<'createdAt' | 'endAt'>,
  statusFilter?: AccountStatusFilter,
): Promise<ListResult<AccountCreateLinkListItem>> {
    if (actor.role !== 'owner') {
        return { items: [], totalCount: 0 };
    }

    const now = new Date();

    if (query) {
      const { items: rows, totalCount } = await findAccountCreateSessionsPaginated(query, statusFilter);
      return { items: rows.map((row: AccountCreateSessionRow) => enrichRow(row, now)), totalCount };
    }

    const rows = await findAccountCreateSessions();
    return { items: rows.map((row) => enrichRow(row, now)), totalCount: rows.length };
}

export async function deactivateAccountCreateLink(
    actor: Actor,
    input: DeactivateAccountCreateLinkInput,
): Promise<{ success: true } | { success: false; error: string }> {
    if (actor.role !== 'owner') {
        return {
            success: false,
            error: 'リンク無効化権限がありません',
        };
    }

    const updated = await deactivateAccountCreateSession(input.uuid);

    if (!updated) {
        return {
            success: false,
            error: '対象のリンクが見つかりません',
        };
    }

    return { success: true };
}
