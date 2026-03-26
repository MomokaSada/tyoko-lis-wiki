export type RouteRequirement =
  | { kind: 'public' }
  | { kind: 'login'; role?: 'admin' | 'owner' }
  | { kind: 'createAndEditPost' }
  | { kind: 'accountCreateSession' };

export function getRequirement(pathname: string): RouteRequirement {
  if (pathname.startsWith('/admin')) return { kind: 'login', role: 'admin' };
  if (pathname.startsWith('/owner')) return { kind: 'login', role: 'owner' };
  if (pathname.startsWith('/auth/register')) return { kind: 'accountCreateSession' };
  if (/^\/posts\/(create|modify)/.test(pathname)) return { kind: 'createAndEditPost' };
  return { kind: 'public' };
}