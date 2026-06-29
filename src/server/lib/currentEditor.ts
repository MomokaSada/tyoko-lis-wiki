import { getCurrentActor } from '@/server/lib/currentActor';
import { findActiveEditSession } from '@/server/repositories/editLinkRepository';

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

  const session = await findActiveEditSession(sessionToken);

  if (!session) {
    return null;
  }

  return {
    type: 'session',
    sessionId: session.uuid,
  };
}
