import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: React.ReactNode;
  theme?: 'blue' | 'emerald' | 'purple' | 'orange' | 'amber' | 'stone' | 'red';
}

const themeMap: Record<string, string> = {
  amber: 'bg-amber-50 text-amber-500',
  emerald: 'bg-emerald-50 text-emerald-500',
  blue: 'bg-blue-50 text-blue-500',
  red: 'bg-red-50 text-red-500',
  purple: 'bg-purple-50 text-purple-500',
  orange: 'bg-orange-50 text-orange-500',
  stone: 'bg-stone-50 text-stone-500',
};

export function StatCard({
  icon,
  label,
  value,
  subtext,
  theme = 'amber',
}: StatCardProps) {
  const themeStyle = themeMap[theme] || themeMap.amber;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase">{label}</span>
        <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-0.5">{value}</h3>
        {subtext && <span className="text-[9px] sm:text-[10px] text-stone-400 block mt-1">{subtext}</span>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-2 ${themeStyle}`}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
    </div>
  );
}
