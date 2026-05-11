import { headers } from 'next/headers';
import { type Metadata } from 'next';
import { Crown, Clock, Shield } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6 animate-in fade-in duration-500 text-stone-900">
        {/* Header / Hero */}
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 relative overflow-hidden">
          {/* Peeking Icon */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-50/50 rounded-full flex items-center justify-center border-8 border-white/50 shadow-sm transition-transform duration-500 hover:scale-105 hover:translate-x-2 hover:translate-y-2 group z-0">
            <Crown className="w-20 h-20 text-amber-500 opacity-20 ml-12 mt-12 transition-transform duration-500 group-hover:rotate-12" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="min-w-0">
              <h2 className="text-4xl font-black text-stone-800 tracking-tighter mb-2 pl-4">Owner Dashboard</h2>
              <p className="text-stone-600 mb-4 pl-4">システム全体に影響する操作（招待・BAN・監査・メンテ）をここに集約しています。</p>
              <div className="flex flex-wrap gap-3 pl-4">
                <span className="bg-stone-200 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                  <Clock size={12} /> {today}
                </span>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                  <Crown size={12} /> owner only
                </span>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                  <Shield size={12} /> {userRole || 'なし'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-stone-100 rounded-full opacity-60"></div>
        </div>

        {/* Main content */}
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
