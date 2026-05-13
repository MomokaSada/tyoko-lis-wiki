import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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

export function DashboardCard({
  href,
  icon,
  title,
  description,
  badgeText,
  theme = 'amber',
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white border border-stone-200 rounded-3xl p-5 hover:shadow-lg hover:border-stone-300 transition-all group relative overflow-hidden min-h-[140px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${themeMap[theme]}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-stone-800 leading-tight group-hover:text-stone-900">{title}</h3>
            <p className="text-xs text-stone-500 font-medium mt-1">{description}</p>
          </div>
        </div>
        {badgeText !== undefined && (
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-4 w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-stone-800 transition-colors">
        管理画面を開く
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
