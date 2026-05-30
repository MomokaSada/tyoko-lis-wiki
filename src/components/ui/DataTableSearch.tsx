'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

type Props = {
  defaultValue: string;
  placeholder: string;
  paramPrefix: string;
  sort: string;
  order: string;
  basePath: string;
};

/**
 * DataTable 内部で使う検索フォーム。
 * Client Component として router.push でクライアントサイド遷移する。
 */
export function DataTableSearch({ defaultValue, placeholder, paramPrefix, sort, order, basePath }: Props) {
  const router = useRouter();
  const p = (name: string) => `${paramPrefix}${name}`;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get(p('q')) as string) ?? '';
    const params = new URLSearchParams();
    if (q) params.set(p('q'), q);
    params.set(p('sort'), sort);
    params.set(p('order'), order);
    params.set(p('page'), '1');
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
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
          name={p('q')}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="search-box-input"
        />
      </div>
    </form>
  );
}
