import { headers } from 'next/headers';
import { type Metadata } from 'next';
import { Crown, Clock, Shield, LayoutDashboard } from 'lucide-react';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getAccountCreateLinks } from '@/server/services/accountCreateLinkService';
import { getManageableAccounts } from '@/server/services/accountBanService';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { getDeviceSessionUsageRecords } from '@/server/services/deviceService';
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

  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';

  const [accountCreateLinks, manageableAccounts, activeIpBans, deviceSessionUsageRecords] =
    actor
      ? await Promise.all([
        getAccountCreateLinks(actor),
        getManageableAccounts(actor),
        getActiveIpBans(actor),
        getDeviceSessionUsageRecords(actor),
      ])
      : [[], [], [], []];

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-700 text-stone-900">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight">Owner Administration</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">システム全体の権限管理、セキュリティ制御、およびメンテナンス操作</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-stone-100 text-stone-600">
              <Clock className="w-3 h-3 mr-1.5" />
              {today}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-800">
              <Crown className="w-3 h-3 mr-1.5" />
              Owner
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <OwnerDashboardClient
          isOwner={isOwner}
          accountCreateLinks={accountCreateLinks}
          manageableAccounts={manageableAccounts}
          activeIpBans={activeIpBans}
          deviceSessionUsageRecords={deviceSessionUsageRecords}
        />
      </div>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
