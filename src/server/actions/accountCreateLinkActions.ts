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
import type { BaseActionState } from '@/server/types/actionState';

export type CreateAccountCreateLinkActionState = BaseActionState & {
  generatedUrl: string | null;
  expiresAt: string | null;
};

export type DeactivateAccountCreateLinkActionState = BaseActionState;

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

export async function deactivateAccountCreateLinkAction(
  _prevState: DeactivateAccountCreateLinkActionState,
  formData: FormData,
): Promise<DeactivateAccountCreateLinkActionState> {
    const parsed = deactivateAccountCreateLinkSchema.safeParse({
        uuid: formData.get('uuid'),
    });

    if (!parsed.success) {
        return {
            error: getFirstZodErrorMessage(parsed.error),
        };
    }

    const actor = await getCurrentActor();

    if (!actor) {
        return {
            error: 'リンク無効化権限がありません',
        };
    }

    const result = await deactivateAccountCreateLink(actor, parsed.data);

    if (!result.success) {
        return {
            error: result.error,
        };
    }

    revalidatePath('/owner/account-create-links');

    return {
        error: null,
    };
}
