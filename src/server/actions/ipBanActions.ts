'use server';

import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { createIpBanSchema } from '@/server/schemas/ipBanSchemas';
import { createIpBan } from '@/server/services/ipBanService';

export type CreateIpBanActionState = {
  error: string | null;
  bannedIp: string | null;
  reason: string | null;
};

export async function createIpBanAction(
  _prevState: CreateIpBanActionState,
  formData: FormData,
): Promise<CreateIpBanActionState> {
  const parsed = createIpBanSchema.safeParse({
    ip: formData.get('ip'),
    browser: formData.get('browser'),
    reason: formData.get('reason'),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodErrorMessage(parsed.error),
      bannedIp: null,
      reason: null,
    };
  }

  const actor = await getCurrentActor();

  if (!actor) {
    return {
      error: 'IPBAN 権限がありません',
      bannedIp: null,
      reason: null,
    };
  }

  const result = await createIpBan(actor, parsed.data);

  if (!result.success) {
    return {
      error: result.error,
      bannedIp: null,
      reason: null,
    };
  }

  return {
    error: null,
    bannedIp: result.data.ip,
    reason: result.data.reason,
  };
}
