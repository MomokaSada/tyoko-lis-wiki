import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionTokenFromCookie } from '@/server/lib/appSessionCookie';
import { getValidSessionByToken } from '@/server/repositories/appSessionRepository';
import { createClient } from '@/lib/supabase/server';
import { Ban } from 'lucide-react';

/**
 * ルートレイアウト内で使用するアカウント BAN ゲート。
 * BAN されたアカウントが保護ルートにアクセスした場合、
 * 通常のページコンテンツの代わりに BAN 通知を表示する。
 *
 * proxy.ts（Edge Runtime）では DB アクセスできないため、
 * Server Component のレイヤーでチェックする。
 */
export async function AccountBanGate({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const appSessionToken = await getSessionTokenFromCookie();

  // セッションがない場合は何もしない（未ログイン）
  if (!userRole && !appSessionToken) {
    return <>{children}</>;
  }

  try {
    // --- Supabase セッションの場合 ---
    if (userRole) {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const [appUser] = await db
          .select({ isActive: users.isActive })
          .from(users)
          .where(eq(users.authUserId, data.user.id))
          .limit(1);

        if (appUser && !appUser.isActive) {
          return <BannedNotice />;
        }
      }
    }

    // --- パスキーセッション（app_session）の場合 ---
    if (appSessionToken) {
      const session = await getValidSessionByToken(appSessionToken);
      if (session) {
        const [appUser] = await db
          .select({ isActive: users.isActive })
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1);

        if (appUser && !appUser.isActive) {
          return <BannedNotice />;
        }
      }
    }
  } catch {
    // エラー時もアクセスを妨げない
    return <>{children}</>;
  }

  return <>{children}</>;
}

function BannedNotice() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl sm:rounded-[2rem] p-8 shadow-sm text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <Ban className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-black text-stone-900">アカウントが BAN されています</h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          このアカウントは BAN されているため、管理画面にアクセスできません。
        </p>
      </div>
    </div>
  );
}
