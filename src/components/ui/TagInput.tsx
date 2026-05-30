'use client';

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

export type TagItem = {
  id: number;
  name: string;
  depth?: number; // 階層表示用の深さ（カテゴリのみ）
};

export type SelectedItem = {
  id?: number;
  name: string;
};

export function TagInput({
  availableItems,
  initialSelectedItems = [],
  nameForExisting,
  nameForNew,
  placeholder = "入力して検索...",
  allowMultipleNew = true,
  onNewItemChange,
}: {
  availableItems: TagItem[];
  initialSelectedItems?: SelectedItem[];
  nameForExisting: string;
  nameForNew: string;
  placeholder?: string;
  allowMultipleNew?: boolean;
  /** Newアイテム（id無し）の有無が変わったときに呼ばれる */
  onNewItemChange?: (hasNewItem: boolean) => void;
}) {
  const [selected, setSelected] = useState<SelectedItem[]>(initialSelectedItems);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false); // サジェスト選択直後か（blur時の二重確定防止）
  const prevHasNewRef = useRef<boolean | null>(null); // 初回発火防止用

  // Newアイテム（id無し）の有無を外部に通知
  useEffect(() => {
    const hasNew = selected.some((s) => s.id === undefined);
    if (hasNew !== prevHasNewRef.current) {
      prevHasNewRef.current = hasNew;
      onNewItemChange?.(hasNew);
    }
  }, [selected, onNewItemChange]);

  // 入力値に基づいてサジェストを生成
  const suggestions = inputValue.trim() ? availableItems.filter(
    (item) =>
      item.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selected.some((s) => s.id === item.id)
  ) : [];

  // 現在の入力を確定する（既存一致 or 新規追加）
  const commitInput = useCallback((val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;

    const preciseMatch = suggestions.find(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (preciseMatch) {
      addSelectedItem({ id: preciseMatch.id, name: preciseMatch.name });
    } else {
      addSelectedItem({ name: trimmed });
    }
  }, [suggestions]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // フォーム自体のエンター送信を防ぐ
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && selected.length > 0) {
      removeSelectedItem(selected[selected.length - 1]);
    }
  };

  const addSelectedItem = (item: SelectedItem) => {
    if (!item.id && !allowMultipleNew) {
      // 複数新規追加不可の場合は、既に新規項目があるなら追加させない
      const hasNew = selected.some(s => !s.id);
      if (hasNew) {
        setInputValue('');
        return; // 何もしないかアラートを出すか
      }
    }
    setSelected((prev) => [...prev, item]);
    setInputValue('');
  };

  const removeSelectedItem = (itemToRemove: SelectedItem) => {
    setSelected((prev) =>
      prev.filter((item) =>
        item.id ? item.id !== itemToRemove.id : item.name !== itemToRemove.name
      )
    );
  };

  const existingIds = selected.filter((s) => s.id).map((s) => s.id);
  const newNamesArray = selected.filter((s) => !s.id).map((s) => s.name);
  const newNamesValue = allowMultipleNew ? newNamesArray.join(',') : (newNamesArray[0] || '');

  return (
    <div className="relative">
      {/* 隠しフォーム送信フィールド */}
      {existingIds.map((id) => (
        <input key={`${nameForExisting}-${id}`} type="hidden" name={nameForExisting} value={id} />
      ))}
      <input type="hidden" name={nameForNew} value={newNamesValue} />

      <div
        className={`flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white border rounded-lg min-h-[40px] cursor-text transition-all ${
          isFocused ? 'border-amber-500 ring-2 ring-amber-50' : 'border-stone-200 shadow-sm'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((item, idx) => (
          <span
            key={item.id ? `ext-${item.id}` : `new-${idx}`}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-md transition-colors ${
              item.id ? 'bg-stone-100 text-stone-700 border border-stone-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {item.name}
            {item.id === undefined && <span className="text-[10px] uppercase font-black opacity-50 ml-1">New</span>}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedItem(item);
              }}
              className="hover:text-red-500 hover:bg-white rounded-full p-0.5 focus:outline-none transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // サジェスト未選択＆未確定テキストがある場合、自動確定する
            setTimeout(() => {
              setIsFocused(false);
              if (justSelectedRef.current) {
                justSelectedRef.current = false;
                return;
              }
              commitInput(inputValue);
            }, 200);
          }}
          placeholder={selected.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm font-medium text-stone-800 py-0.5"
        />
      </div>

      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-[60] w-full mt-1 bg-white border border-stone-300 rounded-xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar py-1">
          {suggestions.map((item) => (
            <li
              key={item.id}
              onMouseDown={(e) => {
                e.preventDefault();
                justSelectedRef.current = true;
                addSelectedItem({ id: item.id, name: item.name });
              }}
              className="cursor-pointer px-3 py-2.5 hover:bg-amber-50 transition-colors border-b last:border-0 border-stone-100"
            >
              <span className="text-sm font-bold text-stone-800">{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
