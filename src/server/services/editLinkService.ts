import { randomUUID } from 'node:crypto';
import { findEditSessions, insertEditSession, deactivateEditSession, type StatusFilter } from '@/server/repositories/editLinkRepository';
import type { CreateEditLinkInput } from '@/server/schemas/editLinkSchemas';
import type { Actor } from '@/types/actor';
import { isUniqueViolation } from '@/server/lib/pgError';
import type { ListQuery, ListResult } from '@/types/listQuery';

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
          url: `/posts/create?session=${uuid}`,
          endAt,
          maxEdits: input.maxEdits,
        },
      };
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
    }
  }

  return {
    success: false,
    error: '編集リンクの生成に失敗しました',
  };
}

export async function getEditLinks(
  actor: Actor,
  query?: ListQuery<'createdAt' | 'endAt' | 'editsUsed'>,
  statusFilter?: StatusFilter,
): Promise<ListResult<EditLinkListItem>> {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return { items: [], totalCount: 0 };
  }

  const { items, totalCount } = await findEditSessions(query, statusFilter);
  const now = new Date();

  return {
    items: items.map((row) => ({
      ...row,
      status: !row.isActive
        ? 'inactive'
        : row.editsUsed >= row.maxEdits
          ? 'limit-reached'
          : row.endAt <= now
            ? 'expired'
            : 'active',
    })),
    totalCount,
  };
}

type DeactivateEditLinkResult =
  | { success: true }
  | { success: false; error: string };

export async function deactivateEditLink(
  actor: Actor,
  uuid: string,
): Promise<DeactivateEditLinkResult> {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return { success: false, error: '権限がありません' };
  }

  const result = await deactivateEditSession(uuid);
  if (!result) {
    return { success: false, error: 'リンクが見つかりませんでした' };
  }

  return { success: true };
}
