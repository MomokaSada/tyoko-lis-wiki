import React from 'react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';

/**
 * トップページのウェルカムバナーセクション
 * サイトの紹介と公開項目数を表示する
 */
export function WelcomeBannerSection({ totalPosts }: { totalPosts: number }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 md:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-5">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-3xl md:text-[2.2rem] font-black text-stone-800 mb-3 tracking-tighter">ちょこちょこ大百科へようこそ！</h2>
        <p className="text-stone-600 mb-6 leading-relaxed">
          Mirrativ配信者「ちょこれ」とそのリスナーの公式コミュニティサイトです。
        </p>
        <div className="flex gap-3">
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            公開済み {totalPosts} 項目
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 bg-stone-100 rounded-full flex items-center justify-center border-[6px] md:border-8 border-white shadow-sm overflow-hidden transform hover:scale-110 transition-transform duration-500">
          <TyokoreIcon className="w-24 h-24 sm:w-28 sm:h-28" />
        </div>
      </div>
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-stone-100 rounded-full opacity-50"></div>
    </div>
  );
}
