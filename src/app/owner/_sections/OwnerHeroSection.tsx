import React from 'react';
import { Crown, Shield } from 'lucide-react';

interface OwnerHeroSectionProps {
  userRole: string | null;
  today: string;
}

/**
 * オーナーダッシュボードのヒーローセクション
 * タイトル、日付、ロールバッジを表示する
 */
export function OwnerHeroSection({ userRole, today }: OwnerHeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-10">
      <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="relative animate-float-in">
        <div className="relative bg-white border border-stone-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-sm">
          <div className="absolute -top-16 sm:-top-20 -left-16 sm:-left-20 w-40 sm:w-56 h-40 sm:h-56 bg-amber-50 rounded-full flex items-center justify-center border-[8px] sm:border-[12px] border-white/60 shadow-inner pointer-events-none">
            <Crown className="w-20 sm:w-24 h-20 sm:h-24 text-amber-400/30 ml-6 sm:ml-8 mt-6 sm:mt-8" />
          </div>

          <div className="absolute -right-12 sm:-right-16 -bottom-12 sm:-bottom-16 w-36 sm:w-44 h-36 sm:h-44 bg-stone-100 rounded-full opacity-60 pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-8 relative z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 pl-1 sm:pl-2">
                <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-amber-500 rounded-full shrink-0" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-stone-900 tracking-tight leading-none">
                  Owner Dashboard
                </h1>
              </div>
              <p className="text-stone-500 text-sm sm:text-base pl-3 sm:pl-4 max-w-lg leading-relaxed">
                システム全体に影響する操作（招待・BAN・監査・メンテ）をここに集約しています。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
