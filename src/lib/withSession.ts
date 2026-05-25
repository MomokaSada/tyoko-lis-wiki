/**
 * 現在のページの ?session=... クエリパラメータを
 * 別のパスに引き継ぐユーティリティ。
 *
 * 使い方:
 *   <Link href={withSession('/posts')}>項目一覧</Link>
 *   router.push(withSession('/admin'))
 */
export function withSession(path: string): string {
  if (typeof window === 'undefined') return path;

  const params = new URLSearchParams(window.location.search);
  const session = params.get('session');
  if (!session) return path;

  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}session=${encodeURIComponent(session)}`;
}
