import { isIP } from 'node:net';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { getRequirement } from './lib/auth/routeRules';
import { ADMIN_ROLES, HEADER_CLIENT_IP, HEADER_USER_ROLE, HEADER_IS_PROTECTED, PATHS } from './lib/auth/constants';

function normalizeCandidateIp(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();

  if (!trimmed) {
    return null;
  }

  const withoutZoneId = trimmed.replace(/%[0-9A-Za-z_.-]+$/, '');

  if (isIP(withoutZoneId)) {
    return withoutZoneId;
  }

  const withoutIpv4Port = withoutZoneId.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);

  if (withoutIpv4Port && isIP(withoutIpv4Port[1])) {
    return withoutIpv4Port[1];
  }

  return null;
}

function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');

  const candidateIps = [
    ...(forwardedFor ? forwardedFor.split(',') : []),
    realIp,
  ];

  return candidateIps
    .map((candidate) => normalizeCandidateIp(candidate))
    .find((candidate): candidate is string => Boolean(candidate));
}

const APP_SESSION_COOKIE_NAME = process.env.APP_SESSION_COOKIE_NAME ?? 'app_session';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request: { headers: request.headers } });

  // ルート要件を先に判定し、public ルートは Auth を完全スキップする
  const requirement = getRequirement(request.nextUrl.pathname);

  let user = null;

  // public ページの Auth 呼び出しは不要（〜100ms 節約）
  if (requirement.kind !== 'public') {
    try {
      const result = await updateSession(request);
      response = result.response;
      user = result.user;
    } catch (error) {
      console.warn('[proxy] Supabase unavailable, running without authentication');
    }
  }

  const requestRole = user?.app_metadata?.role;

  // app_session Cookie の存在確認（パスキー認証ユーザーの判定用）
  const appSessionToken = request.cookies.get(APP_SESSION_COOKIE_NAME)?.value;

  // 新たなリクエストヘッダーを作成する
  const requestHeaders = new Headers(request.headers);

  // クライアントから送信された x-user-role を常に削除し、
  // 認証済みのロール情報のみを設定する（スプーフィング対策）。
  // このヘッダーは Server Components へのヒントであり、
  // 認可判断は Server Action / Service 層で再検証される。
  requestHeaders.delete(HEADER_USER_ROLE);
  requestHeaders.delete(HEADER_CLIENT_IP);
  if (requestRole) {
    requestHeaders.set(HEADER_USER_ROLE, requestRole);
  }

  const clientIp = getClientIpFromHeaders(request.headers);
  if (clientIp) {
    requestHeaders.set(HEADER_CLIENT_IP, clientIp);
  }

  // ルート種別を Server Component に伝える（IP BAN ゲート用）
  requestHeaders.set(HEADER_IS_PROTECTED, requirement.kind !== 'public' ? 'true' : 'false');

  // updateSession がセットした Cookie（リフレッシュされたトークン等）を継承しつつ、
  // 後続の Server Components へリクエストヘッダーを渡すレスポンスを生成する
  const createForwardResponse = (baseResponse: NextResponse) => {
    const newResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // baseResponse (updateSession 等で生成されたもの) の Cookie をまるごとコピー
    baseResponse.cookies.getAll().forEach((cookie) => {
      newResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return newResponse;
  };

  switch (requirement.kind) {
    // ----------------------------------------------------------------
    // 公開ページ: 認証不要
    // ----------------------------------------------------------------
    case 'public':
      return createForwardResponse(response);

    // ----------------------------------------------------------------
    // ログイン必須ページ
    // 未ログイン → NOT_FOUND
    // ログイン済みだがロール不足 → NOT_FOUND
    // ----------------------------------------------------------------
    case 'login': {
      // Supabase Auth セッション または パスキー(app_session) Cookie のいずれかがあれば許可
      if (!user && !appSessionToken) {
        return NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url));
      }

      // Supabase ユーザーがいる場合のみロールチェック
      // （パスキーユーザーはページコンポーネントの getCurrentActor() で権限検証）
      if (user && requirement.role) {
        if (requirement.role === 'admin' && !ADMIN_ROLES.includes(requestRole)) {
          return NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url));
        }
        if (requirement.role === 'owner' && requestRole !== 'owner') {
          return NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url));
        }
      }
      return createForwardResponse(response);
    }

    // ----------------------------------------------------------------
    // 記事作成・編集ページ
    // 管理者/owner ロール → 許可
    // 編集セッショントークン保持者 → 許可
    // 上記以外 → NOT_FOUND
    // 注: Server Action 内部の認可は contentActions.ts で行う
    // ----------------------------------------------------------------
    case 'createAndEditPost': {
      if (user && ADMIN_ROLES.includes(requestRole)) {
        return createForwardResponse(response);
      }

      // パスキー認証済みユーザー（app_session Cookie）も許可
      if (appSessionToken) {
        return createForwardResponse(response);
      }

      const editSessionToken = request.nextUrl.searchParams.get('session');
      if (editSessionToken) {
        return createForwardResponse(response);
      }

      return NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url));
    }

    // ----------------------------------------------------------------
    // アカウント作成セッションページ
    // 既にログイン済み → HOME へリダイレクト
    // 有効なセッショントークン保持者 → 許可
    // 上記以外 → NOT_FOUND
    // ----------------------------------------------------------------
    case 'accountCreateSession': {
      if (user) {
        return NextResponse.redirect(new URL(PATHS.HOME, request.url));
      }

      const accountSessionToken = request.nextUrl.searchParams.get('session');
      if (accountSessionToken) {
        return createForwardResponse(response);
      }

      return NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url));
    }

    // ----------------------------------------------------------------
    // 存在しないページ
    // ----------------------------------------------------------------
    case 'notFound': {
      return NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url));
    }

    // ----------------------------------------------------------------
    // 上記のいずれにも該当しないルート
    // routeRules.ts で未定義のパスは public 相当として通過させる
    // → 新しいルート要件が追加された場合、ここで気付けるように
    //   console.warn を仕込んでおく
    // ----------------------------------------------------------------
    default: {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[proxy] 未処理の route requirement for path: "${request.nextUrl.pathname}"`);
      }
      return createForwardResponse(response);
    }
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
