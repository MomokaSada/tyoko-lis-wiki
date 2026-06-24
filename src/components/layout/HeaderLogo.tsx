'use client';

import React from 'react';
import Link from 'next/link';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import { useWithSession } from '@/client/lib/useWithSession';

/**
 * ヘッダーのロゴ + サイトタイトル部分
 */
export function HeaderLogo() {
  const withSession = useWithSession();

  return (
    <Link href={withSession('/')} className="flex items-center gap-3 cursor-pointer group shrink-0">
      <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
        <TyokoreIcon className="w-6 h-6 md:w-7 md:h-7" />
      </div>
      <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tighter text-stone-900 uppercase">ちょこちょこ大百科</h1>
    </Link>
  );
}
