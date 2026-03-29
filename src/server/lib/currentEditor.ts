import { and, eq, gt, lt } from 'drizzle-orm';
import { db } from '@/db';
import { editSessions } from '@/db/schema';
import { getCurrentActor } from '@/server/lib/currentActor';

export type EditorContext =
  | {
      type: 'actor';
      actorId: number;
      role: 'owner' | 'admin';
    }
  | {
      type: 'session';
      sessionId: string;
    };

export async function getCurrentEditor(sessionToken?: string | null): Promise<EditorContext | null> {
  const actor = await getCurrentActor();

  if (actor) {
    return {
      type: 'actor',
      actorId: actor.id,
      role: actor.role,
    };
  }

  if (!sessionToken) {
    return null;
  }

  const now = new Date();
  const [session] = await db
    .select({
      uuid: editSessions.uuid,
    })
    .from(editSessions)
    .where(
      and(
        eq(editSessions.uuid, sessionToken),
        eq(editSessions.isActive, true),
        gt(editSessions.endAt, now),
        lt(editSessions.editsUsed, editSessions.maxEdits),
      ),
    )
    .limit(1);

  if (!session) {
    return null;
  }

  return {
    type: 'session',
    sessionId: session.uuid,
  };
}
