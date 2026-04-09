import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { getRequirement } from './lib/auth/routeRules';
import { ADMIN_ROLES, HEADER_USER_ROLE, PATHS } from './lib/auth/constants';

/** ロール付きヘッダーを添えて NextResponse.next を返すヘルパー */
function nextWithRole(request: NextRequest, role: string): NextResponse {
  const headers = new Headers(request.headers);
  headers.set(HEADER_USER_ROLE, role);
  return NextResponse.next({ request: { headers } });
}

function isServerActionRequest(request: NextRequest): boolean {
  // Server Actions are posted to the current route and include this header.
  return request.headers.has('next-action');
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);
  const requirement = getRequirement(request.nextUrl.pathname);

  switch (requirement.kind) {
    case 'public':
      return response;

    case 'login': {
      if (!user) {
        return NextResponse.redirect(new URL(PATHS.HOME, request.url));
      }
      const requestRole = user.app_metadata?.role;
      if (requirement.role) {
        if (requirement.role === 'admin' && !ADMIN_ROLES.includes(requestRole)) {
          return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
        }
        if (requirement.role === 'owner' && requestRole !== 'owner') {
          return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
        }
      }
      // ログインユーザーには常に x-user-role を付与する
      return nextWithRole(request, requestRole ?? '');
    }

    case 'createAndEditPost': {
      if (user && ADMIN_ROLES.includes(user.app_metadata?.role)) {
        return nextWithRole(request, user.app_metadata?.role);
      }
      if (isServerActionRequest(request)) {
        return response;
      }
      const editSessionToken = request.nextUrl.searchParams.get('session');
      if (editSessionToken) {
        return response;
      }
      return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
    }

    case 'accountCreateSession': {
      if (user) {
        return NextResponse.redirect(new URL(PATHS.HOME, request.url));
      }
      const accountSessionToken = request.nextUrl.searchParams.get('session');
      if (accountSessionToken) {
        return response;
      }
      return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
    }

    default:
      return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
