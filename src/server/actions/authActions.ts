'use server';

import { redirect } from 'next/navigation';
import { loginSchema, registerSchema } from '@/server/schemas/authSchemas';
import { getCurrentRequestBan } from '@/server/services/ipBanService';
import { getCurrentActor } from '@/server/lib/currentActor';
import { recordAuditLog } from '@/server/services/auditLogService';
import { registerAccount, signIn } from '@/server/services/authService';
import { withAction, parseOrError } from '@/server/lib/withAction';
import type { BaseActionState } from '@/types/actionState';

export type ActionState = BaseActionState;

/** Server Action: ログインフォームの送信を処理する */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const preflight = await withAction({ rateLimit: 'login' });
  if (preflight) return preflight;

  const parsed = parseOrError(loginSchema, {
    username: formData.get('username'),
    password: formData.get('password'),
  });
  if ('error' in parsed) return parsed;

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: 'このIPアドレスからのログインは許可されていません' };
  }

  const result = await signIn(parsed.parsed);
  if (!result.success) {
    await recordAuditLog({
      actorId: null,
      action: 'login_failed',
      detail: { username: parsed.parsed.username },
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

  redirect('/');
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const preflight = await withAction({ rateLimit: 'register' });
  if (preflight) return preflight;

  const parsed = parseOrError(registerSchema, {
    session: formData.get('session'),
    username: formData.get('username'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if ('error' in parsed) return parsed;

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: 'このIPアドレスからのアカウント作成は許可されていません' };
  }

  const result = await registerAccount(parsed.parsed);
  if (!result.success) {
    return { error: result.error };
  }

  const loginResult = await signIn({
    username: parsed.parsed.username,
    password: parsed.parsed.password,
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
