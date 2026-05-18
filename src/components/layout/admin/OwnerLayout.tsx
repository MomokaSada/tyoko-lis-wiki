'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  KeySquare, 
  UserX, 
  ShieldBan, 
  Link2, 
  ImageMinus, 
  ChevronLeft,
  Crown
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group",
        isActive 
          ? "bg-amber-50 text-amber-600 shadow-sm ring-1 ring-amber-200" 
          : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
      ].join(' ')}
    >
      <span className={[
        "transition-colors duration-200",
        isActive ? "text-amber-500" : "text-stone-400 group-hover:text-stone-600"
      ].join(' ')}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

export function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { href: '/owner', icon: <LayoutDashboard size={20} />, label: 'ダッシュボード' },
    { href: '/owner/account-create-links', icon: <KeySquare size={20} />, label: 'アカウント作成' },
    { href: '/owner/account-bans', icon: <UserX size={20} />, label: 'アカウントBAN' },
    { href: '/owner/ip-bans', icon: <ShieldBan size={20} />, label: 'IP BAN' },
    { href: '/owner/edit-link-usage', icon: <Link2 size={20} />, label: '編集リンク利用状況' },
    { href: '/owner/thumbnail-cleanup', icon: <ImageMinus size={20} />, label: 'サムネイル掃除' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-r border-stone-200 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900 font-black text-lg shadow-sm">
              ち
            </div>
            <div>
              <p className="font-black tracking-tight text-stone-900 text-sm">ちょこちょこ大百科</p>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Owner Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-8">
          <div>
            <p className="px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Main Menu</p>
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavItem 
                  key={item.href} 
                  href={item.href} 
                  icon={item.icon} 
                  label={item.label} 
                  isActive={pathname === item.href} 
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-xs text-stone-700">
              管
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-stone-800 truncate">System Owner</p>
              <p className="text-[10px] text-stone-400 truncate">Owner Privileges</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}


