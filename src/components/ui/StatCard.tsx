import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  theme?: 'blue' | 'emerald' | 'purple' | 'orange';
}

const iconThemeMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
};

export function StatCard({
  icon,
  label,
  value,
  subtext,
  theme = 'blue',
}: StatCardProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconThemeMap[theme]}`}>
          {icon}
        </div>
        <span className="text-2xl font-black text-stone-800">{value}</span>
      </div>
      <h3 className="font-bold text-stone-800 mb-1">{label}</h3>
      {subtext && <p className="text-sm text-stone-500">{subtext}</p>}
    </div>
  );
}
