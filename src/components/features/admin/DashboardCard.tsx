import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FolderTree,
  Link as LinkIcon,
  ShieldBan,
  UserX,
  ImageMinus,
  KeySquare,
  FileText,
  Eye,
} from 'lucide-react';

interface DashboardCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeText?: string;
  theme?: 'amber' | 'emerald' | 'blue' | 'red' | 'stone';
}

const themeMap: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  stone: 'bg-stone-100 text-stone-700',
};

/** タイトル文字列から決定論的なハッシュを生成 */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** ひょっこり覗く破片アイコン設定 */
const debrisPresets = [
  // [positionClasses, rotateDeg, scale, sizeClass]
  { pos: 'bottom-[-14px] right-[-18px]', rotate: -8, scale: 1.0,  size: 'w-28 h-28' },
  { pos: 'bottom-[-6px]  right-[-8px]',  rotate: 14, scale: 0.7,  size: 'w-20 h-20' },
  { pos: 'top-[-12px]    left-[-14px]',   rotate: -22, scale: 0.8, size: 'w-24 h-24' },
  { pos: 'top-[-6px]     right-[-10px]',  rotate: 10,  scale: 0.65, size: 'w-20 h-20' },
  { pos: 'bottom-[-8px]  left-[-12px]',   rotate: 18,  scale: 0.85, size: 'w-24 h-24' },
  { pos: 'top-[-10px]    right-[-16px]',  rotate: -14, scale: 1.1,  size: 'w-28 h-28' },
  { pos: 'bottom-[-4px]  left-[-8px]',    rotate: 24,  scale: 0.6,  size: 'w-16 h-16' },
  { pos: 'top-[-8px]     left-[-10px]',   rotate: -6,  scale: 0.75, size: 'w-22 h-22' },
] as const;

/** カードのテーマ→割り当てる破片アイコン候補 */
const debrisIconsByTheme: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>[]> = {
  amber:   [LinkIcon, FileText],
  emerald: [FolderTree, FileText],
  blue:    [KeySquare, LinkIcon],
  red:     [UserX, ShieldBan],
  stone:   [ImageMinus, Eye],
};

export function DashboardCard({
  href,
  icon,
  title,
  description,
  badgeText,
  theme = 'amber',
}: DashboardCardProps) {
  const h = useMemo(() => hashStr(title + href), [title, href]);
  const icons = debrisIconsByTheme[theme] ?? debrisIconsByTheme.amber;
  const preset = debrisPresets[h % debrisPresets.length];
  const DebrisIcon = icons[h % icons.length];

  // 2つ目の破片（variant用、別の位置・角度・アイコン）
  const preset2 = debrisPresets[(h + 3) % debrisPresets.length];
  const DebrisIcon2 = icons[(h + 1) % icons.length];

  return (
    <Link
      href={href}
      className="card-base block bg-white border border-stone-200 rounded-[1.75rem] p-6 group relative overflow-hidden flex flex-col"
    >
      <div className="flex items-start justify-between mb-5">
        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3 shrink-0 ${themeMap[theme]}`}>
          {icon}
        </div>
        {badgeText !== undefined && (
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 text-[11px] font-bold border border-stone-200">
            {badgeText}
          </span>
        )}
      </div>
      <h3 className="text-xl font-extrabold text-stone-900 mb-1.5 tracking-tight group-hover:text-stone-800 transition-colors">{title}</h3>
      <p className="text-sm text-stone-400 font-medium leading-relaxed mb-6 flex-1">{description}</p>

      <div className="w-full py-2.5 bg-stone-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 group-hover:bg-amber-500 transition-colors duration-300 shadow-md">
        管理画面を開く
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
      </div>

      {/* ─── テキストの残骸 ─── ひょっこり覗く破片たち ─── */}
      <DebrisIcon
        className={`debris absolute ${preset.pos} ${preset.size} text-stone-50 opacity-25 pointer-events-none`}
        style={{ transform: `rotate(${preset.rotate}deg) scale(${preset.scale})`, '--r': `${preset.rotate}deg` } as React.CSSProperties}
      />
      <DebrisIcon2
        className={`debris absolute ${preset2.pos} ${preset2.size} text-stone-50 opacity-15 pointer-events-none`}
        style={{ transform: `rotate(${preset2.rotate}deg) scale(${preset2.scale})`, '--r': `${preset2.rotate}deg` } as React.CSSProperties}
      />
    </Link>
  );
}
