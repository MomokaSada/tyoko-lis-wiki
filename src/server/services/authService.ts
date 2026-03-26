import { createClient } from '@/lib/supabase/server';

/** signIn の結果型 */
export type SignInResult =
  | { success: true }
  | { success: false; error: string };

/**
 * ユーザー名 + パスワードでログインする。
 *
 * Supabase Auth はメールベースのため、内部で `username@test.com` のダミーメールに変換する。
 */
export async function signIn(username: string, password: string): Promise<SignInResult> {
  const supabase = await createClient();
  const dummyEmail = `${username}@test.com`;

  const { error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
