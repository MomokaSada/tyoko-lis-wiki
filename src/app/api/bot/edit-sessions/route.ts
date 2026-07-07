import { NextRequest, NextResponse } from "next/server";
import { resolveBotActor } from '@/server/lib/botToken';
import { createBotEditLink, type BotEditLinkInput } from "@/server/services/botEditLinkService";
import { createEditLinkSchema } from "@/server/schemas";
import { apiErrors } from '@/server/errors';

export async function POST(
    request: NextRequest
){
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
        return NextResponse.json(
            {
                error: 'Unauthorized'
            },
            {
                status: 401
            }
        );
    }

    const actor = await resolveBotActor(token);
    if (!actor){
        return NextResponse.json(
            {
                error: 'Unauthorized'
            },
            {
                status: 401
            }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {
                error: 'Invalid JSON body'
            },
            {
                status: 400
            }
        );
    }

    const parsed = createEditLinkSchema.safeParse(body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? 'Invalid input';
        return NextResponse.json(
            {
                error: 'Invalid input'
            },
            {
                status: 422
            }
        );
    }
    try {
        const result = await createBotEditLink(actor.id, parsed.data);

        if (!result.success) {
            if (result.error === 'active_sessions_remaining') {
                return NextResponse.json(
                    { error: apiErrors.botEditSession.activeSessionsRemaining, url: result.url },
                    { status: 409 },
                );
            }
            return NextResponse.json(
                {
                    error: 'Internal server error'
                },
                {
                    status: 500
                }
            );
        }
        return NextResponse.json(
            result.data,
            {
                status: 200
            }
        );
    } catch (error) {
        console.error('Bot edit session creation failed:', error);
        return NextResponse.json(
            {
                error: 'Internal server error'
            },
            {
                status: 500
            }
        );
    }
}