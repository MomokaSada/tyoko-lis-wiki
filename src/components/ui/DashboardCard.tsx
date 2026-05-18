import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface DashboardCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeText?: string;
  theme?: 'amber' | 'emerald' | 'blue' | 'red' | 'stone' | 'purple' | 'orange';
}

const themeStyles: Record<string, { iconWrapper: string; textHover: string }> = {
  amber: { iconWrapper: 'bg-amber-50 text-amber-500', textHover: 'group-hover:text-amber-500' },
  emerald: { iconWrapper: 'bg-emerald-50 text-emerald-500', textHover: 'group-hover:text-emerald-500' },
  blue: { iconWrapper: 'bg-blue-50 text-blue-500', textHover: 'group-hover:text-blue-500' },
  red: { iconWrapper: 'bg-red-50 text-red-500', textHover: 'group-hover:text-red-500' },
  purple: { iconWrapper: 'bg-purple-50 text-purple-500', textHover: 'group-hover:text-purple-500' },
  orange: { iconWrapper: 'bg-orange-50 text-orange-500', textHover: 'group-hover:text-orange-500' },
  stone: { iconWrapper: 'bg-stone-50 text-stone-500', textHover: 'group-hover:text-stone-600' },
};

export function DashboardCard({
  href,
  icon,
  title,
  description,
  badgeText,
  theme = 'amber',
}: DashboardCardProps) {
  const style = themeStyles[theme] || themeStyles.amber;

  return (
    <Link
      href={href}
      className="group relative block bg-white p-5 rounded-2xl border border-stone-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-stone-300"
    >
      <div className="flex flex-col h-full justify-between gap-5">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${style.iconWrapper}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
          </div>
          {badgeText && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-500 bg-stone-100">
              {badgeText}
            </span>
          )}
        </div>

        <div>
          <h3 className={`text-base sm:text-lg font-bold text-stone-900 mb-1 transition-colors ${style.textHover}`}>
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-stone-400 group-hover:text-stone-600 transition-colors mt-2">
          <span>管理画面へ</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
