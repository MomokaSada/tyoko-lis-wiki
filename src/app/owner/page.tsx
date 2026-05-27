import { headers } from 'next/headers';
import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { gte, sql, eq, and } from 'drizzle-orm';
import { Crown, Shield, Plus, RefreshCw } from 'lucide-react';
import { db } from '@/db';
import { users, contents } from '@/db/schema';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getAccountCreateLinks } from '@/server/services/accountCreateLinkService';
import { getManageableAccounts } from '@/server/services/accountBanService';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { getDeviceSessionUsageRecords } from '@/server/services/deviceService';
import { checkDbHealth } from '@/server/services/dbHealthService';
import type { DbHealthStatus } from '@/server/services/dbHealthService';
import { OwnerDashboardClient } from './owner-dashboard-client';
import { MobileActions } from '@/components/posts/MobileActions';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';

export const metadata: Metadata = {
  robots: { index: false },
};

export default async function OwnerPage() {
  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');
  const today = new Date().toLocaleDateString('ja-JP');

  // ── DBヘルスチェック ──
  const dbStatus: DbHealthStatus = await checkDbHealth();

  if (!dbStatus.isConnected) {
    const msg = encodeURIComponent(dbStatus.error ?? 'データベースに接続できません');
    redirect(`/owner/db-error?error=${msg}`);
  }

  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';

  const [accountCreateLinksResult, manageableAccountsResult, activeIpBansResult, deviceSessionUsageRecordsResult] =
    actor
      ? await Promise.all([
        getAccountCreateLinks(actor),
        getManageableAccounts(actor),
        getActiveIpBans(actor),
        getDeviceSessionUsageRecords(actor),
      ])
      : [{ items: [], totalCount: 0 }, { items: [], totalCount: 0 }, { items: [], totalCount: 0 }, { items: [], totalCount: 0 }];

  const accountCreateLinks = accountCreateLinksResult.items;
  const manageableAccounts = manageableAccountsResult.items;
  const activeIpBans = activeIpBansResult.items as {
    id: number; ip: string; browser: string; reason: string;
    blockedBy: number; blockedByName: string | null; createdAt: Date;
  }[];
  const deviceSessionUsageRecords = deviceSessionUsageRecordsResult.items;

  // ── システム概要の実データ ──
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayUsersRows, totalUsersRows, totalContentsRows, publishedContentsRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, todayStart)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents),
    db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(eq(contents.isPublished, true)),
  ]);

  const todayUsers = Number(todayUsersRows[0]?.count ?? 0);
  const totalUsers = Number(totalUsersRows[0]?.count ?? 0);
  const totalContents = Number(totalContentsRows[0]?.count ?? 0);
  const publishedContents = Number(publishedContentsRows[0]?.count ?? 0);

  // 編集利用率：全セッションの editsUsed / maxEdits の平均
  const totalEditsUsed = deviceSessionUsageRecords.reduce((sum, r) => sum + r.editsUsed, 0);
  const totalMaxEdits = deviceSessionUsageRecords.reduce((sum, r) => sum + r.maxEdits, 0);
  const editUtilization = totalMaxEdits > 0 ? Math.round((totalEditsUsed / totalMaxEdits) * 100) : 0;

  // 項目公開率
  const publishRate = totalContents > 0 ? Math.round((publishedContents / totalContents) * 100) : 0;

  return (
    <>
      {/* ═══ Owner Dashboard ═══ */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
        {/* 背景ドット */}
        <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" aria-hidden="true" />

        <div className="relative animate-float-in">
          {/* ── ヒーロー的背景レイヤー ── */}
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-10 overflow-hidden shadow-sm">
            {/* デコル要素: 左上のcircle + 王冠 */}
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-amber-50 rounded-full flex items-center justify-center border-[12px] border-white/60 shadow-inner pointer-events-none">
              <Crown className="w-24 h-24 text-amber-400/30 ml-8 mt-8" />
            </div>

            {/* 右下のオーブ */}
            <div className="absolute -right-16 -bottom-16 w-44 h-44 bg-stone-100 rounded-full opacity-60 pointer-events-none" />

            {/* 中央右のアクセント */}
            <div className="absolute top-8 right-32 w-3 h-3 bg-amber-400 rounded-full animate-pulse-glow pointer-events-none" />

            {/* コンテンツ */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
              {/* 左: タイトル */}
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-3 pl-2">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                  <h1 className="text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-none">
                    Owner Dashboard
                  </h1>
                </div>
                <p className="text-stone-500 text-base pl-4 max-w-lg leading-relaxed">
                  システム全体に影響する操作（招待・BAN・監査・メンテ）をここに集約しています。
                </p>

                {/* メタバッジ群 */}
                <div className="flex flex-wrap gap-2.5 mt-5 pl-4">
                  <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs font-bold px-3.5 py-1.5 rounded-full border border-stone-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {today}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-200">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    owner only
                  </span>
                  {userRole && (
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-green-200">
                      <Shield className="w-3.5 h-3.5" />
                      {userRole}
                    </span>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Main Grid ═══ */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <OwnerDashboardClient
          isOwner={isOwner}
          dbStatus={dbStatus}
          accountCreateLinks={accountCreateLinks}
          manageableAccounts={manageableAccounts}
          activeIpBans={activeIpBans}
          deviceSessionUsageRecords={deviceSessionUsageRecords}
          todayUsers={todayUsers}
          totalUsers={totalUsers}
          editUtilization={editUtilization}
          publishRate={publishRate}
        />
      </section>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
