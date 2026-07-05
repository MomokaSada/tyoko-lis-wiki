import { randomUUID } from 'node:crypto';
import {
    insertEditSession,
    findActiveSessionsByAuthor,
} from '@/server/repositories/editLinkRepository' ;
import { error } from 'node:console';

export type BotEditLinkInput = {
    expiresInMinutes: number;
    maxEdits: number;
};

export type BotEditLinkSuccess = {
    success: true;
    data: {
        uuid: string;
        url: string;
        endAt: string;
        maxEdits: number;
        authorId: number;
    };
};

export type BotEditLinkRejected = {
  success: false;
  error: 'active_sessions_remaining';
};

export type BotEditLinkResult = BotEditLinkSuccess | BotEditLinkRejected;

const MIN_REMAINING_EDITS = 10;

export async function createBotEditLink(
    authorId: number,
    input: BotEditLinkInput,
): Promise<BotEditLinkResult> {
    const activeSessions = await findActiveSessionsByAuthor(authorId, MIN_REMAINING_EDITS);
    if (activeSessions.length > 0) {
        return {
            success: false,
            error: 'active_sessions_remaining'
        };
    };

    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + input.expiresInMinutes * 60 * 1000);
    const uuid = randomUUID();

    await insertEditSession({
        uuid,
        authorId,
        maxEdits: input.maxEdits,
        startAt,
        endAt,
    });

    return {
        success: true,
        data: {
            uuid,
            url: `/posts/create?session=${uuid}`,
            endAt: endAt.toISOString(),
            maxEdits: input.maxEdits,
            authorId,
        },
    };
}