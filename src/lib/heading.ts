export function normalizeHeadingText(rawText: string): string {
  let text = rawText.trim();

  // ATX 見出し末尾の閉じ # を除去 (e.g. "Title ##")
  text = text.replace(/\s+#+\s*$/, '');

  // Markdown のインライン要素をプレーンテキスト化
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1'); // image
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // link
  text = text.replace(/`([^`]+)`/g, '$1'); // inline code
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2'); // strong
  text = text.replace(/(\*|_)(.*?)\1/g, '$2'); // em
  text = text.replace(/~~(.*?)~~/g, '$1'); // del
  text = text.replace(/<[^>]+>/g, ''); // inline html

  // Markdownエスケープを解除 (e.g. "\#" -> "#")
  text = text.replace(/\\([\\`*_{}[\]()#+\-.!|>])/g, '$1');

  // 空白整形
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

export function createHeadingIdBase(text: string): string {
  const normalized = normalizeHeadingText(text);
  const slugSource = normalized.toLowerCase().replace(/\s+/g, '-');
  const safe = slugSource.length > 0 ? slugSource : 'section';
  return encodeURIComponent(safe);
}

export function createUniqueHeadingId(baseId: string, usedIds: Map<string, number>): string {
  const count = usedIds.get(baseId) ?? 0;
  usedIds.set(baseId, count + 1);
  return count === 0 ? baseId : `${baseId}-${count + 1}`;
}
