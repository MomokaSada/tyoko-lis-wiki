import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { isCurrentAccountBanned } from '@/server/services/accountBanService';
import { getSessionTokenFromCookie } from '@/server/lib/appSessionCookie';
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
    let supabaseUserId: string | null = null;
    if (userRole) {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      supabaseUserId = data?.user?.id ?? null;
    }

    if (await isCurrentAccountBanned(supabaseUserId, appSessionToken)) {
      return <BannedNotice />;
    }
  } catch (error) {
    // エラー時もアクセスを妨げない（可用性を優先）
    // ただしエラーは記録しておく
    console.error('[AccountBanGate] BANチェックエラー:', error);
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
