'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: 'アクティブ' },
  { value: 'expired', label: '期限切れ' },
  { value: 'inactive', label: '無効' },
] as const;

export function StatusFilterSelect({
  currentStatus,
  currentQ,
  currentSort,
  currentOrder,
}: {
  currentStatus: string;
  currentQ: string;
  currentSort: string;
  currentOrder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const status = e.target.value;
      const params = new URLSearchParams();
      if (currentQ) params.set('q', currentQ);
      if (status !== 'all') params.set('status', status);
      if (currentSort !== 'createdAt') params.set('sort', currentSort);
      if (currentOrder !== 'desc') params.set('order', currentOrder);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, currentQ, currentSort, currentOrder],
  );

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="text-xs font-bold rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
    >
      {STATUS_OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
