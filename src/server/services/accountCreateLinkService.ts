import { randomUUID } from 'crypto';
import {
    deactivateAccountCreateSession,
    findAccountCreateSessions,
    insertAccountCreateSession,
} from '@/server/repositories/accountCreateLinkRepository';
import type {
    CreateAccountCreateLinkInput,
    DeactivateAccountCreateLinkInput,
} from '@/server/schemas/accountCreateLinkSchemas';

type Actor = {
    id: number;
    role: 'owner' | 'admin' | 'bot';
};

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

function isAccountCreateSessionUuidConflict(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
    );
}


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
            if (!isAccountCreateSessionUuidConflict(error)) {
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

export async function getAccountCreateLinks(actor: Actor): Promise<AccountCreateLinkListItem[]> {
    if (actor.role !== 'owner') {
        return [];
    }

    const rows = await findAccountCreateSessions();
    const now = new Date();

    return rows.map((row) => ({
        ...row,
        status: !row.isActive
            ? 'inactive'
            : row.endAt <= now
              ? 'expired'
              : 'active',
    }));
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
