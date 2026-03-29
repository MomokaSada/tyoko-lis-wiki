'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { banAccountSchema } from '@/server/schemas/accountBanSchemas';
import { banAccount } from '@/server/services/accountBanService';

export async function banAccountAction(formData: FormData) {
  const parsed = banAccountSchema.safeParse({
    userId: formData.get('userId'),
  });

  if (!parsed.success) {
    throw new Error(getFirstZodErrorMessage(parsed.error));
  }

  const actor = await getCurrentActor();

  if (!actor) {
    throw new Error('アカウントBAN権限がありません');
  }

  const result = await banAccount(actor, parsed.data);

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath('/admin/account-bans');
}
