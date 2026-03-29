'use server';

import { createAccountCreateLinkSchema } from '@/server/schemas/accountCreateLinkSchemas';
import { deactivateAccountCreateLinkSchema } from '@/server/schemas/accountCreateLinkSchemas';
import {
  createAccountCreateLink,
  deactivateAccountCreateLink,
} from '@/server/services/accountCreateLinkService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { revalidatePath } from 'next/cache';

export type CreateAccountCreateLinkActionState = {
  error: string | null;
  generatedUrl: string | null;
  expiresAt: string | null;
};

export async function createAccountCreateLinkAction(
  _prevState: CreateAccountCreateLinkActionState,
  formData: FormData,
) {
    const parsed = createAccountCreateLinkSchema.safeParse({
        expiresInMinutes: formData.get('expiresInMinutes'),
    });

    if (!parsed.success) {
        return {
            error: getFirstZodErrorMessage(parsed.error),
            generatedUrl: null,
            expiresAt: null,
        };
    }

    const actor = await getCurrentActor();

    if (!actor) {
        return {
            error: 'リンク発行権限がありません',
            generatedUrl: null,
            expiresAt: null,
        };
    }

    const result = await createAccountCreateLink(actor, parsed.data);

    if (!result.success) {
        return {
            error: result.error,
            generatedUrl: null,
            expiresAt: null,
        };
    }

    return {
        error: null,
        generatedUrl: result.data.url,
        expiresAt: result.data.endAt.toISOString(),
    };
}

export async function deactivateAccountCreateLinkAction(formData: FormData) {
    const parsed = deactivateAccountCreateLinkSchema.safeParse({
        uuid: formData.get('uuid'),
    });

    if (!parsed.success) {
        throw new Error(getFirstZodErrorMessage(parsed.error));
    }

    const actor = await getCurrentActor();

    if (!actor) {
        throw new Error('リンク無効化権限がありません');
    }

    const result = await deactivateAccountCreateLink(actor, parsed.data);

    if (!result.success) {
        throw new Error(result.error);
    }

    revalidatePath('/admin/account-create-links');
}
