'use client';

import { useRef, useCallback } from 'react';

const UUID_PATTERN = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/i;

/**
 * 入力されたテキストからURLの一部として含まれるUUIDを自動抽出する検索入力。
 * - ペースト時: URLが貼り付けられた場合、UUID部分だけを抽出
 * - フォーム送信時: 同様にUUIDを抽出してから送信
 */
export function SearchInput({
  defaultValue,
  sort,
  order,
  status,
}: {
  defaultValue: string;
  sort: string;
  order: string;
  status: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** テキストからUUID部分だけを抽出して入力欄にセット、抽出できたかどうかを返す */
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const input = inputRef.current;
    if (input) {
      extractUuid(input.value);
    }
  }

  return (
    <form ref={formRef} method="GET" action="/admin/edit-links" onSubmit={handleSubmit} className="contents">
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="order" value={order} />
      <input type="hidden" name="page" value="1" />
      {status !== 'all' && <input type="hidden" name="status" value={status} />}
      <div className="search-box">
        <svg className="search-box-icon w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
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
