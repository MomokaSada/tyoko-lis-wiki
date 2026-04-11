import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { getRequirement } from './lib/auth/routeRules';
import { ADMIN_ROLES, HEADER_USER_ROLE, PATHS } from './lib/auth/constants';

function isServerActionRequest(request: NextRequest): boolean {
  // Server Actions are posted to the current route and include this header.
  return request.headers.has('next-action');
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);
  const requirement = getRequirement(request.nextUrl.pathname);
  
  const requestRole = user?.app_metadata?.role;

  // 新たなリクエストヘッダーを作成し、ロール情報を追加
  const requestHeaders = new Headers(request.headers);
  if (requestRole) {
    requestHeaders.set(HEADER_USER_ROLE, requestRole);
  }

  // 1つのクリーンなレスポンスを作成するヘルパー
  // updateSessionがセットしたクッキー（リフレッシュされたトークン等）を継承しつつ、
  // 後続のServer Componentsへリクエストヘッダーを渡す
  const createForwardResponse = (baseResponse: NextResponse) => {
    // リダイレクト等のNextResponseの場合もあるため、そのままではheadersが適用されない。
    // そのため、通常の遷移である NextResponse.next() に対してのみ headers を渡す
    const newResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // baseResponse (updateSession 等で生成されたもの) の Cookie をまるごとコピー
    baseResponse.cookies.getAll().forEach(cookie => {
      newResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return newResponse;
  };

  switch (requirement.kind) {
    case 'public':
      return createForwardResponse(response);

    case 'login': {
      if (!user) {
        return NextResponse.redirect(new URL(PATHS.HOME, request.url));
      }
      if (requirement.role) {
        if (requirement.role === 'admin' && !ADMIN_ROLES.includes(requestRole)) {
          return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
        }
        if (requirement.role === 'owner' && requestRole !== 'owner') {
          return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
        }
      }
      return createForwardResponse(response);
    }

    case 'createAndEditPost': {
      if (user && ADMIN_ROLES.includes(requestRole)) {
        return createForwardResponse(response);
      }
      if (isServerActionRequest(request)) {
        return createForwardResponse(response);
      }
      const editSessionToken = request.nextUrl.searchParams.get('session');
      if (editSessionToken) {
        return createForwardResponse(response);
      }
      return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
    }

    case 'accountCreateSession': {
      if (user) {
        return NextResponse.redirect(new URL(PATHS.HOME, request.url));
      }
      const accountSessionToken = request.nextUrl.searchParams.get('session');
      if (accountSessionToken) {
        return createForwardResponse(response);
      }
      return NextResponse.redirect(new URL(PATHS.UNAUTHORIZED, request.url));
    }

    default:
      return createForwardResponse(response);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (hot module replacement)
     * - favicon.ico (favicon file)
     * - public assets (images, etc)
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
