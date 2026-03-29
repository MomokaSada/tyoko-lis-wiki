import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  createInvitedUser,
  findActiveAccountCreateSession,
  findUserByName,
} from '@/server/repositories/authRepository';
import { buildDummyEmail, normalizeUsername } from '@/server/lib/dummyEmail';
import { hashPassword } from '@/server/lib/password';
import type { LoginInput, RegisterInput } from '@/server/schemas/authSchemas';

/** signIn の結果型 */
export type SignInResult =
  | { success: true }
  | { success: false; error: string };

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

/**
 * ユーザー名 + パスワードでログインする。
 *
 * Supabase Auth はメールベースのため、内部で `username@test.com` のダミーメールに変換する。
 */
export async function signIn({ username, password }: LoginInput): Promise<SignInResult> {
  const supabase = await createClient();
  const dummyEmail = buildDummyEmail(username);

  const { error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function registerAccount(input: RegisterInput): Promise<RegisterResult> {
  const session = await findActiveAccountCreateSession(input.session);

  if (!session) {
    return { success: false, error: '招待リンクが無効か期限切れです' };
  }

  const normalizedUsername = normalizeUsername(input.username);
  const existingUser = await findUserByName(normalizedUsername);

  if (existingUser) {
    return { success: false, error: 'そのユーザー名はすでに使われています' };
  }

  const supabaseAdmin = createAdminClient();
  const dummyEmail = buildDummyEmail(normalizedUsername);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: dummyEmail,
    password: input.password,
    email_confirm: true,
    app_metadata: input.type === 'admin' ? { role: 'admin' } : { role: 'bot' },
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message ?? '認証ユーザーの作成に失敗しました',
    };
  }

  try {
    await createInvitedUser({
      sessionId: input.session,
      authUserId: data.user.id,
      username: normalizedUsername,
      passwordHash: hashPassword(input.password),
      type: input.type,
    });
  } catch (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);

    if (
      typeof dbError === 'object' &&
      dbError !== null &&
      'code' in dbError &&
      dbError.code === '23505'
    ) {
      return { success: false, error: 'そのユーザー名はすでに使われています' };
    }

    throw dbError;
  }

  return { success: true };
}
