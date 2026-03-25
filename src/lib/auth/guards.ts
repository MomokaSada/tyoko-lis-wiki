import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function requireEditSession(sessionToken: string | undefined | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  if (userRole === 'admin' || userRole === 'owner') {
    return {
      valid: true,
      user: user,
    };
  }

  if (!sessionToken) {
    redirect('/unauthorized');
  }

  const isValid = /* Drizzle で sessionToken を検索し、期限や使用回数をチェックする処理 */ true;

  if (!isValid) {
    redirect('/unauthorized');
  }

  return {
    valid: true,
    user: null,
    token: sessionToken,
  };
}

export async function requireAccountCreateSession(sessionToken: string | undefined | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  if (userRole === 'admin' || userRole === 'owner') {
    redirect('/');
  }

  if (!sessionToken) {
    redirect('/unauthorized');
  }
  const isValid = /* Drizzle で sessionToken を検索し、期限や使用回数をチェックする処理 */ true;

  if (!isValid) {
    redirect('/unauthorized');
  }
  return {
    valid: true,
    user: null,
    token: sessionToken,
  };
}
