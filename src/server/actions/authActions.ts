'use server';

import { redirect } from 'next/navigation';
import { signIn } from '@/server/services/authService';

/** Server Action: ログインフォームの送信を処理する */
export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    return { error: 'ユーザー名とパスワードを入力してください' };
  }

  const result = await signIn(username, password);

  if (!result.success) {
    return { error: result.error };
  }

  // サーバーサイドリダイレクト（クライアント往復なしで高速）
  redirect('/');
}
