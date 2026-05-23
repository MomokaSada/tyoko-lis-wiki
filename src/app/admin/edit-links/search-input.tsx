'use client';

import { useRef } from 'react';

const UUID_PATTERN = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/i;

/**
 * ペーストされたテキストからURLが含まれていてもUUID部分だけを抽出する検索入力。
 */
export function SearchInput({
  defaultValue,
  sort,
  order,
}: {
  defaultValue: string;
  sort: string;
  order: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text');
    const match = pasted.match(UUID_PATTERN);
    if (match) {
      // URLなどにUUIDが含まれていた場合、UUIDだけを入力欄にセットする
      e.preventDefault();
      const input = e.currentTarget;
      input.value = match[0];
      // カーソルを末尾に移動
      input.setSelectionRange(match[0].length, match[0].length);
    }
  }

  return (
    <form ref={formRef} method="GET" action="/admin/edit-links" className="contents">
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="order" value={order} />
      <input type="hidden" name="page" value="1" />
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
