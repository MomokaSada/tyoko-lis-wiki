import { headers } from 'next/headers';
import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { gte, sql, eq, and } from 'drizzle-orm';
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
import { MobileActions } from '@/components/layout/MobileActions';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { OwnerHeroSection } from './_sections/OwnerHeroSection';

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

  const totalEditsUsed = deviceSessionUsageRecords.reduce((sum, r) => sum + r.editsUsed, 0);
  const totalMaxEdits = deviceSessionUsageRecords.reduce((sum, r) => sum + r.maxEdits, 0);
  const editUtilization = totalMaxEdits > 0 ? Math.round((totalEditsUsed / totalMaxEdits) * 100) : 0;
  const publishRate = totalContents > 0 ? Math.round((publishedContents / totalContents) * 100) : 0;

  return (
    <>
      {/* ═══ Owner Dashboard ═══ */}
      <OwnerHeroSection userRole={userRole} today={today} />

      {/* ═══ Main Grid ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
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
      />
    </>
  );
}
