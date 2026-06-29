'use client';

import React from 'react';
import Link from 'next/link';
import { useWithSession } from '@/client/lib/useWithSession';

/**
 * ヘッダーのロゴ部分
 */
export function HeaderLogo() {
  const withSession = useWithSession();

  return (
    <Link href={withSession('/')} className="flex items-center cursor-pointer group shrink-0">
      <img
        src="/images/logo.webp"
        alt="ちょこちょこ大百科"
        className="w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
        style={{ height: "clamp(44px, 8vw, 80px)" }}
      />
    </Link>
  );
}
