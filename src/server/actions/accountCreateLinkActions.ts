'use server';

import {
    createAccountCreateLinkSchema,
    deactivateAccountCreateLinkSchema,
} from '@/server/schemas';

import {
    createAccountCreateLink,
    deactivateAccountCreateLink,
} from '@/server/services/accountCreateLinkService';
import { recordAuditLog } from '@/server/services/auditLogService';

import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';

import { commonErrors } from '@/server/errors';
import { withAction } from '@/server/actions/modules/withAction';
import { revalidatePath } from 'next/cache';
import type { BaseActionState } from '@/types/actionState';

export type CreateAccountCreateLinkActionState = BaseActionState & {
    generatedUrl: string | null;
    expiresAt: string | null;
};

export type DeactivateAccountCreateLinkActionState = BaseActionState;

export async function createAccountCreateLinkAction(
    _prevState: CreateAccountCreateLinkActionState,
    formData: FormData,
): Promise<CreateAccountCreateLinkActionState> {
    const preflight = await withAction({ rateLimit: 'createAccountCreateLink' });
    if (preflight) return { ...preflight, generatedUrl: null, expiresAt: null };

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
            error: commonErrors.accountCreateLink.createPermissionDenied,
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

    await recordAuditLog({
        actorId: actor.id,
        action: "create_account_link",
        targetType: "account_link",
        detail: { expiresAt: result.data.endAt.toISOString() },
    });

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
    const preflight = await withAction({ device: false });
    if (preflight) return preflight;

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
            error: commonErrors.accountCreateLink.deactivatePermissionDenied,
        };
    }

    const result = await deactivateAccountCreateLink(actor, parsed.data);

    if (!result.success) {
        return {
            error: result.error,
        };
    }

    await recordAuditLog({
        actorId: actor.id,
        action: "deactivate_account_link",
        targetType: "account_link",
        targetId: parsed.data.uuid,
    });

    revalidatePath('/owner/account-create-links');

    return {
        error: null,
    };
}
