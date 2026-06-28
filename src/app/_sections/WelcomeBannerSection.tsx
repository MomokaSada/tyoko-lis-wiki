import React from 'react';
import { Clock, Shield } from 'lucide-react';

interface WelcomeBannerSectionProps {
  totalPosts: number;
}

/**
 * トップページのウェルカムバナーセクション
 * Admin / Owner のヒーローセクションを左右ミラーし、
 * 装飾円を右上、アプリアイコンを右側から見せるレイアウト
 */
export function WelcomeBannerSection({ totalPosts }: WelcomeBannerSectionProps) {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  return (
    <section className="w-full">
      <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="relative bg-white border border-stone-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-sm">
          {/* 右上の装飾円 (Admin/Owner と左右対称) */}
          <div className="absolute -top-16 sm:-top-20 -right-16 sm:-right-20 w-40 sm:w-56 h-40 sm:h-56 bg-stone-100 rounded-full flex items-center justify-center border-[8px] sm:border-[12px] border-white/60 shadow-inner pointer-events-none">
            {/* アプリアイコン (Tyokore Icon 相当) */}
            <div className="w-28 sm:w-36 h-28 sm:h-36 mr-6 sm:mr-8 mt-6 sm:mt-8 relative shrink-0 overflow-hidden rotate-32">
              <div className="absolute inset-0 scale-110">
                <img
                  alt="Application Icon"
                  className="w-full h-full object-cover"
                  src="/images/app-icon.webp"
                />
              </div>
            </div>
          </div>

          {/* 左下の補助円 (Admin/Owner と左右対称) */}
          <div className="absolute -left-12 sm:-left-16 -bottom-12 sm:-bottom-16 w-36 sm:w-44 h-36 sm:h-44 bg-stone-50 rounded-full opacity-60 pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-10 relative z-10">
            {/* テキスト群には右側のアイコン分の余白を確保 */}
            <div className="min-w-0 flex-1 lg:max-w-[calc(100%-12rem)] xl:max-w-[calc(100%-16rem)]">
              {/* 左端のバー + タイトル */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 pl-1 sm:pl-2">
                <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-stone-400 rounded-full shrink-0" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-stone-900 tracking-tight leading-none">
                  ちょこちょこ大百科へようこそ！
                </h1>
              </div>

              {/* 説明文 */}
              <p className="text-stone-500 text-sm sm:text-base pl-3 sm:pl-4 max-w-2xl leading-relaxed">
                Mirrativ 配信者「ちょこれ」とそのリスナーの公式コミュニティサイトです。
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
