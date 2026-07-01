export type RouteRequirement =
  | { kind: 'public' }
  | { kind: 'login'; role?: 'admin' | 'owner' }
  | { kind: 'createAndEditPost' }
  | { kind: 'accountCreateSession' }
  | { kind: 'notFound' };

export function getRequirement(pathname: string): RouteRequirement {
  // 保護ルート（前方一致、特異なものほど先に）
  if (pathname.startsWith('/admin')) return { kind: 'login', role: 'admin' };
  if (pathname.startsWith('/owner')) return { kind: 'login', role: 'owner' };
  if (pathname.startsWith('/auth/register')) return { kind: 'accountCreateSession' };
  if (/^\/posts\/(create|modify)/.test(pathname)) return { kind: 'createAndEditPost' };

  // 既知の公開ルート
  if (
    pathname === '/' ||
    pathname === '/auth/login' ||
    pathname === '/posts' ||
    pathname.startsWith('/posts/') ||
    pathname.startsWith('/guide/') ||
    pathname.startsWith('/error-pages/') ||
    pathname.startsWith('/_errors/') ||
    // API Route: 各ルート内部でレート制限・認証・CRON 秘密鍵の検証を行うため
    // proxy 層では公開扱いとし、ハンドラ側に認可を委譲する。
    pathname.startsWith('/api/') ||
    pathname === '/privacy' ||
    pathname === '/terms'
  ) {
    return { kind: 'public' };
  }

  // 上記のいずれにも該当しない → 存在しないページ扱い
  return { kind: 'notFound' };
}
