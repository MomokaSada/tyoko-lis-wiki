'use server';

import { redirect } from 'next/navigation';
import { getFirstZodErrorMessage } from '@/server/lib/zodError';
import { loginSchema, registerSchema } from '@/server/schemas/authSchemas';
import { recordCurrentRequestDevice } from '@/server/services/deviceService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { recordAuditLog } from '@/server/services/auditLogService';
import { registerAccount, signIn } from '@/server/services/authService';
import { checkRateLimit } from '@/server/services/rateLimitService';
import type { BaseActionState } from '@/server/types/actionState';

export type ActionState = BaseActionState;

/** Server Action: ログインフォームの送信を処理する */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('login');
  if (!rateLimitResult.allowed) {
    return { error: 'ログイン試行が多すぎます。しばらくしてから再度お試しください。' };
  }

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
    await recordAuditLog({
      actorId: null,
      action: 'login_failed',
      detail: { username: parsed.data.username },
    });
    return { error: result.error };
  }

  const actor = await getCurrentActor();
  await recordAuditLog({
    actorId: actor?.id ?? null,
    action: 'login',
    targetType: 'user',
    targetId: actor?.id != null ? String(actor.id) : null,
  });

  // サーバーサイドリダイレクト（クライアント往復なしで高速）
  redirect('/');
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await recordCurrentRequestDevice();

  const rateLimitResult = await checkRateLimit('register');
  if (!rateLimitResult.allowed) {
    return { error: 'アカウント作成試行が多すぎます。しばらくしてから再度お試しください。' };
  }

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

  const loginResult = await signIn({
    username: parsed.data.username,
    password: parsed.data.password,
  });

  if (!loginResult.success) {
    return { error: loginResult.error };
  }

  const actor = await getCurrentActor();
  await recordAuditLog({
    actorId: actor?.id ?? null,
    action: 'register',
    targetType: 'user',
    targetId: actor?.id != null ? String(actor.id) : null,
  });

  redirect('/');
}
