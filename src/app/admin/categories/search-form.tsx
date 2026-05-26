'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

export function CategorySearchForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get('q') as string) ?? '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('page', '1');
    router.push(`/admin/categories?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSubmit} className="contents">
      <div className="search-box">
        <button
          type="submit"
          className="search-box-icon w-4 h-4"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit' }}
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="カテゴリを検索..."
          className="search-box-input"
        />
      </div>
    </form>
  );
}
