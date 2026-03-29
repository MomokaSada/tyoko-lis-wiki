'use server';

import { redirect } from 'next/navigation';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { loginSchema, registerSchema } from '@/server/schemas/authSchemas';
import { registerAccount, signIn } from '@/server/services/authService';

/** Server Action: ログインフォームの送信を処理する */
export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: getFirstZodErrorMessage(parsed.error) };
  }

  const result = await signIn(parsed.data);

  if (!result.success) {
    return { error: result.error };
  }

  // サーバーサイドリダイレクト（クライアント往復なしで高速）
  redirect('/');
}

export async function registerAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = registerSchema.safeParse({
    session: formData.get('session'),
    username: formData.get('username'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    type: formData.get('type'),
  });

  if (!parsed.success) {
    return { error: getFirstZodErrorMessage(parsed.error) };
  }

  const result = await registerAccount(parsed.data);

  if (!result.success) {
    return { error: result.error };
  }

  redirect('/auth/login?registered=1');
}
