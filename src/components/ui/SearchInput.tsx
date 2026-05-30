'use client';

import { useRef, useCallback, type ReactNode, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const UUID_PATTERN = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/i;

/**
 * UUID検索入力。ペースト時・送信時にURLからUUIDを自動抽出する。
 * router.push によるクライアントサイド遷移でページリロードを防ぐ。
 *
 * - sort / order / page の hidden input は内包している
 * - 追加の hidden input が必要な場合は children で渡す
 */
export function SearchInput({
  defaultValue,
  sort,
  order,
  basePath,
  children,
}: {
  defaultValue: string;
  sort: string;
  order: string;
  basePath: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractUuid = useCallback((text: string): boolean => {
    const match = text.match(UUID_PATTERN);
    if (match) {
      const input = inputRef.current;
      if (input) {
        input.value = match[0];
        input.setSelectionRange(match[0].length, match[0].length);
      }
      return true;
    }
    return false;
  }, []);

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text');
    if (extractUuid(pasted)) {
      e.preventDefault();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = inputRef.current;
    if (input) {
      extractUuid(input.value);
    }
    const fd = new FormData(e.currentTarget);
    const q = (fd.get('q') as string) ?? '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);
    params.set('page', '1');
    // children の hidden input も FormData に入っているので引き継ぐ
    const form = e.currentTarget;
    for (const el of form.elements) {
      if (el instanceof HTMLInputElement && el.type === 'hidden' && el.name && el.name !== 'q' && el.name !== 'sort' && el.name !== 'order' && el.name !== 'page') {
        if (el.value) params.set(el.name, el.value);
      }
    }
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="contents">
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="order" value={order} />
      <input type="hidden" name="page" value="1" />
      {children}
      <div className="search-box">
        <button type="submit" className="search-box-icon w-4 h-4" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit' }}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={defaultValue}
          onPaste={handlePaste}
          placeholder="UUID または URL を貼り付け..."
          className="search-box-input"
        />
      </div>
    </form>
  );
}
