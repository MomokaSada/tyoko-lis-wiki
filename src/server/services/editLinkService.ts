import { randomUUID } from 'node:crypto';
import { findEditSessions, insertEditSession } from '@/server/repositories/editLinkRepository';
import type { CreateEditLinkInput } from '@/server/schemas/editLinkSchemas';

type Actor = {
  id: number;
  role: 'owner' | 'admin' | 'bot';
};

type CreateEditLinkResult =
  | {
      success: true;
      data: {
        uuid: string;
        url: string;
        endAt: Date;
        maxEdits: number;
      };
    }
  | {
      success: false;
      error: string;
    };

export type EditLinkListItem = {
  uuid: string;
  authorId: number;
  authorName: string | null;
  maxEdits: number;
  editsUsed: number;
  isActive: boolean;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
  status: 'active' | 'expired' | 'inactive' | 'limit-reached';
};

function isEditSessionUuidConflict(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

export async function createEditLink(
  actor: Actor,
  input: CreateEditLinkInput,
): Promise<CreateEditLinkResult> {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return {
      success: false,
      error: 'リンク発行権限がありません',
    };
  }

  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + input.expiresInMinutes * 60 * 1000);

  for (let i = 0; i < 3; i += 1) {
    try {
      const uuid = randomUUID();

      await insertEditSession({
        uuid,
        authorId: actor.id,
        maxEdits: input.maxEdits,
        startAt,
        endAt,
      });

      return {
        success: true,
        data: {
          uuid,
          url: `/posts/modify?session=${uuid}`,
          endAt,
          maxEdits: input.maxEdits,
        },
      };
    } catch (error) {
      if (!isEditSessionUuidConflict(error)) {
        throw error;
      }
    }
  }

  return {
    success: false,
    error: '編集リンクの生成に失敗しました',
  };
}

export async function getEditLinks(actor: Actor): Promise<EditLinkListItem[]> {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return [];
  }

  const rows = await findEditSessions();
  const now = new Date();

  return rows.map((row) => ({
    ...row,
    status: !row.isActive
      ? 'inactive'
      : row.editsUsed >= row.maxEdits
        ? 'limit-reached'
        : row.endAt <= now
          ? 'expired'
          : 'active',
  }));
}
