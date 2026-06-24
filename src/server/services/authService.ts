import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
    findActiveAccountCreateSession,
    deactivateAccountCreateSession,
} from '@/server/repositories/accountCreateLinkRepository';
import {
    createInvitedUser,
    findUserByName,
    findUserByNameWithPassword,
} from '@/server/repositories/authRepository';

import {
    buildDummyEmail,
    normalizeUsername,
} from '@/server/lib/dummyEmail';
import {
    hashPassword,
    verifyPassword,
} from '@/server/services/modules/password';
import { isUniqueViolation } from '@/server/lib/pgError';

import type { LoginInput, RegisterInput } from '@/server/schemas';
import {
    commonErrors,
    serviceErrors,
} from '@/server/errors';

/** signIn の結果型 */
export type SignInResult =
  | { success: true }
  | { success: false; error: string };

/** verifyCredentials の結果型 */
export type VerifyCredentialsResult =
  | { success: true; userId: number }
  | { success: false; error: string };

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

/**
 * ユーザー名 + パスワードでログインする。
 *
 * Supabase Auth はメールベースのため、内部で `username@test.com` のダミーメールに変換する。
 */
export async function signIn({ userName, password }: LoginInput): Promise<SignInResult> {
  const normalizedUsername = normalizeUsername(userName);
  const existingUser = await findUserByName(normalizedUsername);

  if (existingUser && !existingUser.isActive) {
    return {
      success: false,
      error: commonErrors.auth.accountBanned,
    };
  }

  const supabase = await createClient();
  const dummyEmail = buildDummyEmail(normalizedUsername);

  const { error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * ユーザー名 + パスワードの組み合わせを検証する（セッションは作成しない）。
 * 認証に成功した場合は userId を返す。
 */
export async function verifyCredentials({ userName, password }: LoginInput): Promise<VerifyCredentialsResult> {
  const normalizedUsername = normalizeUsername(userName);
  const user = await findUserByNameWithPassword(normalizedUsername);

  if (!user) {
    return { success: false, error: commonErrors.auth.invalidCredentials };
  }

  if (!user.isActive) {
    return { success: false, error: commonErrors.auth.accountBanned };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { success: false, error: commonErrors.auth.invalidCredentials };
  }

  return { success: true, userId: user.id };
}

export async function registerAccount(input: RegisterInput): Promise<RegisterResult> {
  const session = await findActiveAccountCreateSession(input.session);

  if (!session) {
    return { success: false, error: serviceErrors.auth.invalidInvitationLink };
  }

  const normalizedUsername = normalizeUsername(input.userName);
  const existingUser = await findUserByName(normalizedUsername);

  if (existingUser) {
    return { success: false, error: serviceErrors.auth.userNameTaken };
  }

  const supabaseAdmin = createAdminClient();
  const dummyEmail = buildDummyEmail(normalizedUsername);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: dummyEmail,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message ?? serviceErrors.auth.authUserCreateFailed,
    };
  }

  try {
    await createInvitedUser({
      sessionId: input.session,
      authUserId: data.user.id,
      userName: normalizedUsername,
      passwordHash: await hashPassword(input.password),
      type: 'admin',
    });

    await deactivateAccountCreateSession(input.session);
  } catch (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);

    if (isUniqueViolation(dbError)) {
      return { success: false, error: serviceErrors.auth.userNameTaken };
    }

    throw dbError;
  }

  return { success: true };
}
