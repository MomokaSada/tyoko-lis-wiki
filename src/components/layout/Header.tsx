"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWithSession } from '@/client/lib/useWithSession';
import { HeaderLogo } from './HeaderLogo';
import { HeaderNav } from './HeaderNav';
import { HeaderSearch } from './HeaderSearch';
import { HeaderMobileMenu } from './HeaderMobileMenu';

interface HeaderProps {
  userRole?: string | null;
}

/**
 * アプリケーション全体の共通ヘッダー
 * ロゴ、ナビゲーション、検索、モバイルメニューを統合する
 */
export const Header = ({ userRole }: HeaderProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const withSession = useWithSession();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(withSession(`/posts?q=${encodeURIComponent(searchQuery)}`));
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="border-b border-stone-100 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4 relative">
        <HeaderLogo />

        <HeaderNav userRole={userRole} />

        <HeaderSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />
      </div>

      {/* モバイルメニュー */}
      <HeaderMobileMenu
        isOpen={mobileOpen}
        searchQuery={searchQuery}
        userRole={userRole}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        onNavClick={closeMobileMenu}
      />
    </header>
  );
};
