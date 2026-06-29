/**
 * カテゴリの親パスを名前の配列として取得（ルート → 自身）
 * フロント側で整形するため、バックエンドからは親子関係だけを受け取る方式。
 */
export function getCategoryPath(
  categoryId: number,
  allCategories: Array<{ id: number; name: string; parentId: number | null }>,
): string[] {
  const path: string[] = [];
  let current = allCategories.find((c) => c.id === categoryId);

  for (let i = 0; i < 10 && current; i++) {
    path.unshift(current.name);
    if (current.parentId === null) break;
    current = allCategories.find((c) => c.id === current!.parentId);
  }

  return path;
}

/**
 * "aa > bb > cc" 形式のラベル文字列を生成。
 * 単純なテキスト表示用。SVGアイコンなどで表示したい場合は getCategoryPath を使ってください。
 */
export function getCategoryLabel(
  categoryId: number,
  allCategories: Array<{ id: number; name: string; parentId: number | null }>,
): string {
  return getCategoryPath(categoryId, allCategories).join(' > ');
}
