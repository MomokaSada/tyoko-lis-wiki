import { randomUUID } from 'node:crypto';
import {
    insertEditSession,
    findActiveSessionsByAuthor,
} from '@/server/repositories/editLinkRepository' ;


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
  url: string;
};

export type BotEditLinkResult = BotEditLinkSuccess | BotEditLinkRejected;

const MIN_REMAINING_EDITS = 10;

export async function createBotEditLink(
    authorId: number,
    input: BotEditLinkInput,
): Promise<BotEditLinkResult> {
    const activeSession = await findActiveSessionsByAuthor(authorId, MIN_REMAINING_EDITS);
    if (activeSession) {
        return {
            success: false,
            error: 'active_sessions_remaining',
            url: `/posts/create?session=${activeSession.uuid}`
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