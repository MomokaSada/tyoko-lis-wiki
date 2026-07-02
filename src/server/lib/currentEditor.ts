import { cache } from 'react';
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

/**
 * 現在のリクエストにおける編集者コンテキストを取得する。
 *
 * React.cache でラップすることで、同一リクエスト内で
 * generateMetadata とページ本体の両方から呼ばれても
 * 1回の actor/session 解決で済む。
 */
export const getCurrentEditor = cache(async (sessionToken?: string | null): Promise<EditorContext | null> => {
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
});
