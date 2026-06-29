'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Loader2, ListFilter, ArrowDownWideNarrow, ArrowUpNarrowWide, Eye, Clock, Calendar, Type } from 'lucide-react';
import type {
    ContentSortKey,
    SortOrder,
} from '@/server/types/repositoryTypes';

interface PostSearchControlProps {
  initialQuery: string;
  initialSort: string;
  initialOrder: string;
  session?: string;
  showPrivate?: boolean;
}

const SORT_OPTIONS = [
  { key: 'updatedAt', label: '更新日時', icon: Clock },
  { key: 'createdAt', label: '作成日時', icon: Calendar },
  { key: 'viewCount', label: '閲覧数', icon: Eye },
  { key: 'title', label: 'タイトル', icon: Type },
];

export function PostSearchControl({
  initialQuery,
  initialSort,
  initialOrder,
  session,
  showPrivate,
}: PostSearchControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<ContentSortKey>(initialSort as ContentSortKey || 'updatedAt');
  const [order, setOrder] = useState<SortOrder>(initialOrder as SortOrder || 'desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        updateParams({ q: query });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const currentSortOption = SORT_OPTIONS.find(opt => opt.key === sort) || SORT_OPTIONS[0];
  const CurrentSortIcon = currentSortOption.icon;

  return (
    <div className="w-full max-w-3xl ml-auto animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 px-2 sm:px-0">
      <div className="relative flex flex-col md:flex-row items-stretch md:h-[68px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2rem] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)] focus-within:border-amber-500/30 focus-within:bg-white/10 transition-all duration-500 overflow-visible group">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur();
          }}
          className="flex-1 flex items-center pl-5 md:pl-7 py-3.5 md:py-0 relative"
        >
          <div className="shrink-0 mr-3">
            {isPending ? (
              <Loader2 className="w-[18px] h-[18px] text-amber-500 animate-spin" />
            ) : (
              <Search className="w-[18px] h-[18px] text-stone-500 group-focus-within:text-amber-400 transition-colors duration-500" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・本文・スラグで検索..."
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-white placeholder:text-stone-600 text-[15px] md:text-[1.05rem]"
          />
        </form>

        <div className="hidden md:block w-px h-10 self-center bg-white/10 mx-2" />

        <div className="relative flex items-center px-4 pb-4 md:pb-0 md:pr-2" ref={dropdownRef}>
          <div className="w-full flex items-center gap-1 h-12 md:h-[52px] bg-white/5 rounded-2xl md:rounded-full p-1 transition-all hover:bg-white/10">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-4 md:px-5 h-full rounded-xl md:rounded-full transition-all text-xs md:text-sm font-black whitespace-nowrap ${
                isDropdownOpen ? 'bg-amber-500 text-stone-900 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)]' : 'text-stone-400 hover:text-white'
              }`}
            >
              <CurrentSortIcon size={16} className={isDropdownOpen ? 'text-stone-900' : 'text-amber-500'} />
              <span>{currentSortOption.label}</span>
              <ListFilter size={14} className={`transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : 'text-stone-400'}`} />
            </button>
            
            <div className="w-px h-6 bg-white/10 mx-1" />
            
            <button
              onClick={() => {
                const newOrder = order === 'asc' ? 'desc' : 'asc';
                setOrder(newOrder);
                updateParams({ order: newOrder });
                inputRef.current?.blur();
              }}
              className="w-11 h-full flex items-center justify-center rounded-full transition-all text-stone-400 hover:text-amber-400 hover:bg-white/5 group/order"
              title={order === 'asc' ? '昇順' : '降順'}
            >
              {order === 'asc' ? (
                <ArrowUpNarrowWide size={18} className="group-hover/order:-translate-y-0.5 transition-transform" />
              ) : (
                <ArrowDownWideNarrow size={18} className="group-hover/order:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>

          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+16px)] right-0 w-60 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-2.5 space-y-1">
                <div className="px-4 py-3 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-500">並べ替え項目</span>
                </div>
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = sort === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSort(option.key as ContentSortKey);
                        updateParams({ sort: option.key });
                        setIsDropdownOpen(false);
                        inputRef.current?.blur();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[1.1rem] transition-all text-sm font-bold group/item ${
                        isSelected 
                          ? 'bg-amber-500 text-stone-900 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.3)]' 
                          : 'text-stone-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isSelected ? 'text-stone-900' : 'group-hover/item:text-amber-400 transition-colors'} />
                        {option.label}
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
