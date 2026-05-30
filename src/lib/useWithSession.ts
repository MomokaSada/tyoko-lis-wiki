import { useSearchParams } from 'next/navigation';

/**
 * 現在のページの ?session=... クエリパラメータを
 * 別のパスに引き継ぐ関数を返す React Hook。
 *
 * 使い方（クライアントコンポーネント内）:
 *   const withSession = useWithSession();
 *   <Link href={withSession('/posts')}>項目一覧</Link>
 *   router.push(withSession('/admin'))
 */
export function useWithSession(): (path: string) => string {
  const searchParams = useSearchParams();
  const session = searchParams.get('session');

  return (path: string) => {
    if (!session) return path;
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}session=${encodeURIComponent(session)}`;
  };
}
