import { randomUUID } from 'crypto';
import { insertAccountCreateSession } from '@/server/repositories/accountCreateLinkRepository';
import type { CreateAccountCreateLinkInput } from '@/server/schemas/accountCreateLinkSchemas';

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
    if (actor.role !== 'owner' && actor.role !== 'admin') {
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
