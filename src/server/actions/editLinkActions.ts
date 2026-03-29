'use server';

import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { createEditLinkSchema } from '@/server/schemas/editLinkSchemas';
import { createEditLink } from '@/server/services/editLinkService';

export type CreateEditLinkActionState = {
  error: string | null;
  generatedUrl: string | null;
  expiresAt: string | null;
  maxEdits: number | null;
};

export async function createEditLinkAction(
  _prevState: CreateEditLinkActionState,
  formData: FormData,
): Promise<CreateEditLinkActionState> {
  const parsed = createEditLinkSchema.safeParse({
    expiresInMinutes: formData.get('expiresInMinutes'),
    maxEdits: formData.get('maxEdits'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      generatedUrl: null,
      expiresAt: null,
      maxEdits: null,
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: 'リンク発行権限がありません',
      generatedUrl: null,
      expiresAt: null,
      maxEdits: null,
    };
  }

  const result = await createEditLink(actor, parsed.data);

  if (!result.success) {
    return {
      error: result.error,
      generatedUrl: null,
      expiresAt: null,
      maxEdits: null,
    };
  }

  return {
    error: null,
    generatedUrl: result.data.url,
    expiresAt: result.data.endAt.toISOString(),
    maxEdits: result.data.maxEdits,
  };
}
