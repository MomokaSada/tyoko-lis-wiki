'use server';

import { redirect } from 'next/navigation';
import { loginSchema, registerSchema } from '@/server/schemas';
import { recordAuditLog } from '@/server/services/auditLogService';
import {
    registerAccount,
    signIn,
} from '@/server/services/authService';
import { getCurrentRequestBan } from '@/server/services/ipBanService';

import {
    getSessionTokenFromCookie,
    deleteSessionCookie,
} from '@/server/lib/appSessionCookie';
import { getCurrentActor } from '@/server/lib/currentActor';

import {
    withAction,
    parseOrError,
} from '@/server/actions/modules/withAction';
import { createClient } from '@/lib/supabase/server';

import { deactivateSession } from '@/server/services/appSessionService';
import { commonErrors } from '@/server/errors';
import type { BaseActionState } from '@/types/actionState';

export type ActionState = BaseActionState;

/**
 * Server Action: ログアウト処理。
 * Supabase Auth のセッションとアプリケーションセッションの両方を破棄する。
 */
export async function logoutAction(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const sessionToken = await getSessionTokenFromCookie();
    if (sessionToken) {
        await deactivateSession(sessionToken);
    }

    await deleteSessionCookie();
}

/** Server Action: ログインフォームの送信を処理する */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const preflight = await withAction({ rateLimit: 'login' });
  if (preflight) return preflight;

  const parsed = parseOrError(loginSchema, {
    userName: formData.get('userName'),
    password: formData.get('password'),
  });
  if ('error' in parsed) return parsed;

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: commonErrors.ip.loginNotAllowed };
  }

  const result = await signIn(parsed.parsed);
  if (!result.success) {
    await recordAuditLog({
      actorId: null,
      action: 'login_failed',
      detail: { userName: parsed.parsed.userName },
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
    userName: formData.get('userName'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if ('error' in parsed) return parsed;

  const activeBan = await getCurrentRequestBan();
  if (activeBan) {
    return { error: commonErrors.ip.registerNotAllowed };
  }

  const result = await registerAccount(parsed.parsed);
  if (!result.success) {
    return { error: result.error };
  }

  const loginResult = await signIn({
    userName: parsed.parsed.userName,
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
