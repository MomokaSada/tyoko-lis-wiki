'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { getCategoryPath } from '@/lib/clientCategoryUtils';

type CategoryItem = {
  id: number;
  name: string;
  parentId: number | null;
};

export function CategorySearchPicker({
  categories,
  value,
  onChange,
  excludeId,
  name,
  placeholder = "カテゴリを検索...",
}: {
  categories: CategoryItem[];
  value: number | null;
  onChange: (id: number | null) => void;
  /** 選択肢から除外するカテゴリID（編集中の自分自身など） */
  excludeId?: number;
  /** hidden input の name 属性 */
  name?: string;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);

  // 選択中のカテゴリ
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === value) ?? null,
    [categories, value],
  );

  // 入力値に基づいてサジェストを生成（選択済み・除外対象は除く）
  const suggestions = useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return [];

    return categories.filter(
      (item) =>
        item.id !== excludeId &&
        item.id !== value &&
        item.name.toLowerCase().includes(trimmed.toLowerCase()),
    );
  }, [inputValue, categories, excludeId, value]);

  const handleSelect = useCallback(
    (cat: CategoryItem) => {
      onChange(cat.id);
      setInputValue('');
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setInputValue('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // サジェストがある場合は先頭を選択
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
      // 新規追加はしない
    } else if (e.key === 'Backspace' && inputValue === '' && selectedCategory) {
      handleClear();
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
      }
    }, 200);
  };

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value ?? ''} />

      <div
        className={`flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white border rounded-lg min-h-[40px] cursor-text transition-all ${
          isFocused
            ? 'border-amber-500 ring-2 ring-amber-50'
            : 'border-stone-200 shadow-sm'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedCategory ? (
          /* 選択済みチップ表示 */
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <Search size={12} className="text-amber-400 shrink-0" />
            {selectedCategory.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="hover:text-red-500 hover:bg-white rounded-full p-0.5 focus:outline-none transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ) : (
          /* 検索入力フィールド */
          <>
            <Search size={14} className="text-stone-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="flex-1 min-w-[140px] outline-none bg-transparent text-sm font-medium text-stone-800 py-0.5"
            />
          </>
        )}
      </div>

      {/* サジェストドロップダウン */}
      {isFocused && !selectedCategory && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-stone-300 rounded-xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar py-1">
          {suggestions.map((item) => {
            // フロント側で親パスを解決
            const pathSegments = getCategoryPath(item.id, categories);
            const selfName = item.name;
            const selfIdx = pathSegments.lastIndexOf(selfName);
            const MAX_SEGMENTS = 3;
            let displaySegments: string[];
            let showEllipsis = false;
            if (selfIdx <= 0 || pathSegments.length <= MAX_SEGMENTS) {
              displaySegments = pathSegments;
            } else {
              const start = Math.max(0, selfIdx - MAX_SEGMENTS + 1);
              if (start > 0) showEllipsis = true;
              displaySegments = pathSegments.slice(start);
            }
            return (
              <li
                key={item.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  justSelectedRef.current = true;
                  handleSelect(item);
                }}
                className="cursor-pointer px-3 py-2.5 hover:bg-amber-50 transition-colors border-b last:border-0 border-stone-100"
              >
                <div className="flex items-center gap-0.5 flex-wrap min-w-0">
                  {showEllipsis && (
                    <span className="text-[11px] text-stone-400 font-medium shrink-0 mr-0.5">
                      …
                    </span>
                  )}
                  {displaySegments.map((seg, si) => {
                    const isLast = si === displaySegments.length - 1;
                    const isSelf = seg === selfName && isLast;
                    return (
                      <span key={si} className="inline-flex items-center gap-0.5 min-w-0">
                        {si > 0 && (
                          <span className="text-stone-300 mx-1 text-xs select-none shrink-0">
                            ›
                          </span>
                        )}
                        <span
                          className={`truncate ${
                            isSelf
                              ? 'text-sm font-bold text-stone-800'
                              : 'text-[11px] font-medium text-stone-400'
                          }`}
                        >
                          {seg}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
