const jstFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function formatDateTimeJst(date: Date) {
  return jstFormatter.format(date);
}

/**
 * ISO 文字列または Date を 「2026年05月30日 23:09」形式 (JST) に変換する。
 * - 秒は省き「時:分」まで表示
 * - 主に有効期限表示などカード内の日時表示に使う
 */
export function formatDateTimeJp(
  input: string | Date | null | undefined,
): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '—';
  const JST_OFFSET = 9 * 60; // UTC+9 (minutes)
  const jstMs = date.getTime() + JST_OFFSET * 60 * 1000;
  const jst = new Date(jstMs);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jst.getUTCDate()).padStart(2, '0');
  const h = String(jst.getUTCHours()).padStart(2, '0');
  const min = String(jst.getUTCMinutes()).padStart(2, '0');
  return `${y}年${m}月${d}日 ${h}:${min}`;
}
