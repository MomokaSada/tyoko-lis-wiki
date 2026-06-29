import { headers } from 'next/headers';
import { HEADER_CLIENT_IP, HEADER_IS_PROTECTED } from '@/lib/auth/constants';
import { findActiveBlockByIp } from '@/server/repositories/ipBanRepository';
import { ShieldBan } from 'lucide-react';

/**
 * ルートレイアウト内で使用する IP BAN ゲート。
 * 保護ルート（/owner/*, /admin/* など）に BAN 済みIPからアクセスがあった場合、
 * 通常のページコンテンツの代わりに BAN 通知を表示する。
 *
 * proxy.ts（Edge Runtime）では DB アクセスできないため、
 * Server Component のレイヤーでチェックする。
 */
export async function IpBanGate({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const isProtected = headersList.get(HEADER_IS_PROTECTED) === 'true';
  const clientIp = headersList.get(HEADER_CLIENT_IP);

  // 保護ルートでなければ何もしない
  if (!isProtected || !clientIp) {
    return <>{children}</>;
  }

  try {
    const ban = await findActiveBlockByIp(clientIp);

    if (!ban) {
      return <>{children}</>;
    }

    // BAN 済みIPからのアクセス → コンテンツを差し替え
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl sm:rounded-[2rem] p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <ShieldBan className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-black text-stone-900">アクセスがブロックされました</h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            このIPアドレスは BAN されているため、管理画面にアクセスできません。
          </p>
          {ban.reason && (
            <div className="bg-stone-50 rounded-xl p-4 text-left">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">BAN 理由</p>
              <p className="text-sm text-stone-700">{ban.reason}</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    // DB エラーなどが発生してもアクセスを妨げない
    return <>{children}</>;
  }
}
