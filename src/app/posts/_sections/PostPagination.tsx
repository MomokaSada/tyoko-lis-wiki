'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PostPaginationProps {
  totalPages: number;
  currentPage: number;
}

export function PostPagination({ totalPages, currentPage }: PostPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <span
          role="button"
          aria-disabled="true"
          tabIndex={-1}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-stone-50 border border-stone-100 text-stone-300 cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </span>
      )}

      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md border border-stone-200 p-1.5 rounded-3xl shadow-sm">
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <div key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-stone-400">
                <MoreHorizontal size={16} />
              </div>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <Link
              key={page}
              href={createPageUrl(page as number)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-all ${
                isCurrent
                  ? 'bg-[#0c0c0c] text-white shadow-lg scale-110 z-10'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm"
        >
          <ChevronRight size={20} />
        </Link>
      ) : (
        <span
          role="button"
          aria-disabled="true"
          tabIndex={-1}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-stone-50 border border-stone-100 text-stone-300 cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </span>
      )}
    </div>
  );
}
