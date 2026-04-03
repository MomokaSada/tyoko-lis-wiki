'use server';

import { redirect } from 'next/navigation';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { loginSchema, registerSchema } from '@/server/schemas/authSchemas';
import { recordCurrentRequestDevice } from '@/server/services/deviceService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';
import { registerAccount, signIn } from '@/server/services/authService';
import type { BaseActionState } from '@/server/types/actionState';

export type ActionState = BaseActionState;

/** Server Action: ログインフォームの送信を処理する */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await recordCurrentRequestDevice();

  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: getFirstZodErrorMessage(parsed.error) };
  }

  const activeBan = await getCurrentRequestBan();

  if (activeBan) {
    return { error: 'このIPアドレスからのログインは許可されていません' };
  }

  const result = await signIn(parsed.data);

  if (!result.success) {
    return { error: result.error };
  }

  // サーバーサイドリダイレクト（クライアント往復なしで高速）
  redirect('/');
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    session: formData.get('session'),
    username: formData.get('username'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: getFirstZodErrorMessage(parsed.error) };
  }

  const activeBan = await getCurrentRequestBan();

  if (activeBan) {
    return { error: 'このIPアドレスからのアカウント作成は許可されていません' };
  }

  const result = await registerAccount(parsed.data);

  if (!result.success) {
    return { error: result.error };
  }

  await recordCurrentRequestDevice();

  const loginResult = await signIn({
    username: parsed.data.username,
    password: parsed.data.password,
  });

  if (!loginResult.success) {
    return { error: loginResult.error };
  }

  redirect('/');
}
