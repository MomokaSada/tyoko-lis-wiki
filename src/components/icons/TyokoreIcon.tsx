import React from 'react';
import Image from 'next/image';

/**
 * Tailwind の width クラス（w-{n}）からピクセル値を抽出する。
 * 例: "w-10 h-10" → "40px"  /  "w-7 h-7" → "28px"
 * マッチしない場合はデフォルト値 "40px" を返す。
 */
function extractSizeFromClass(className: string): string {
  const match = className.match(/\bw-(\d+)\b/);
  if (!match) return '40px';
  // Tailwind spacing scale: w-1 = 4px, w-2 = 8px, …, w-80 = 320px
  return `${parseInt(match[1], 10) * 4}px`;
}

export const TyokoreIcon = ({ className = "w-10 h-10" }: { className?: string }) => {
  const sizes = extractSizeFromClass(className);

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-white border-2 border-[#d4a373] shadow-sm ${className}`}>
      <div className="absolute inset-0 scale-110">
        <Image
          src="/images/character/tyokore.png"
          alt="Tyokore Icon"
          fill
          sizes={sizes}
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
};