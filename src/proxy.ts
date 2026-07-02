import { isIP } from 'node:net';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { getRequirement } from './lib/auth/routeRules';
import { ADMIN_ROLES, HEADER_CLIENT_IP, HEADER_USER_ROLE, HEADER_IS_PROTECTED, PATHS } from './lib/auth/constants';
import { logger } from '@/server/lib/logger';

// ---------------------------------------------------------------------------
// Content Security Policy
// ---------------------------------------------------------------------------
// ポリシーは middleware で動的に設定し、next.config の静的な headers は使わない。
// これにより将来 script の nonce 対応が容易になる。
// ---------------------------------------------------------------------------

/** Supabase のオリジンを環境変数から抽出（ローカル dev と本番の両方に対応） */
function getSupabaseOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // port がデフォルト（80/443）の場合は省略
    const portStr = parsed.port ? `:${parsed.port}` : '';
    return `${parsed.protocol}//${parsed.hostname}${portStr}`;
  } catch {
    return null;
  }
}

function buildCspHeader(): string {
  const supabaseOrigin = getSupabaseOrigin();
  // img-src / connect-src には Supabase のオリジンを動的に追加
  const imgSources = ["'self'", 'data:', 'blob:', '*.supabase.co'];
  const connectSources = ["'self'", '*.supabase.co'];

  if (supabaseOrigin && !supabaseOrigin.includes('supabase.co')) {
    // ローカル開発環境: *.supabase.co はマッチしないので明示的に追加
    imgSources.push(supabaseOrigin);
    connectSources.push(supabaseOrigin);
  }

  return [
    "default-src 'self'",
    // Next.js はインラインスクリプト (RSC ペイロード, next/dynamic 等) を
    // 大量に生成するため 'unsafe-inline' は必須。プロダクションでは
    // strict-dynamic への移行を検討する。
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    // Next.js は CSS-in-JS 的な手法でインラインスタイルを注入する
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    // 画像: 自サイト + Supabase Storage + data URI (OGP fallback)
    `img-src ${imgSources.join(' ')}`,
    // Google Fonts (Inter) 用
    "font-src 'self' data: fonts.gstatic.com fonts.googleapis.com",
    // Supabase API / Auth への接続
    `connect-src ${connectSources.join(' ')}`,
    // セキュリティ: iframe / プラグイン / base タグを制限
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

/** レスポンスに各種セキュリティヘッダーを追加する */
function setSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('Content-Security-Policy', buildCspHeader());
  // HSTS: 常に HTTPS で通信させる（本番環境のみ有効）
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  // MIME スニッフィング対策
  res.headers.set('X-Content-Type-Options', 'nosniff');
  // リファラー情報の送信ポリシー (クロスオリジンへのリーク防止)
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

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

/**
 * クライアントIPをヘッダーから取得する。
 *
 * 信頼できるリバースプロキシがない構成では `x-forwarded-for` は
 * クライアントが自由に送信できる値であり、そのまま信頼すると
 * レート制限やIP BANのスプーフィングに繋がる。
 *
 * - TRUSTED_PROXY_COUNT が設定されている場合:
 *   x-forwarded-for の**右端から数えて TRUSTED_PROXY_COUNT 個**を
 *   信頼できるプロキシのホップとみなし、その1つ前をクライアントIPとする。
 *   （例: TRUSTED_PROXY_COUNT=1 の場合、右端がプロキシ、その左がクライアント）
 * - TRUSTED_PROXY_COUNT が未設定（既定）の場合:
 *   x-forwarded-for を信用せず、x-real-ip のみ参照する。
 *   どちらもなければ null を返す。
 *   開発環境では警告ログを出力する。
 */
function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const trustedProxyCount = process.env.TRUSTED_PROXY_COUNT;

  if (trustedProxyCount) {
    const count = parseInt(trustedProxyCount, 10);
    if (!isNaN(count) && count >= 0 && forwardedFor) {
      const ips = forwardedFor
        .split(',')
        .map((ip) => normalizeCandidateIp(ip))
        .filter((ip): ip is string => Boolean(ip));
      // 右端から count 個を信頼できるプロキシとして除外
      if (ips.length > count) {
        return ips[ips.length - 1 - count];
      }
    }
    // x-forwarded-for から取得できなかった場合のフォールバック
    if (realIp) {
      const normalized = normalizeCandidateIp(realIp);
      if (normalized) return normalized;
    }
  } else {
    // TRUSTED_PROXY_COUNT 未設定 → リバースプロキシ不在とみなす
    // x-forwarded-for はクライアントが任意に設定できるため信頼しない
    if (process.env.NODE_ENV === 'development') {
      logger.info(
        '[proxy] TRUSTED_PROXY_COUNT が設定されていません。' +
        'セルフホスト構成ではリバースプロキシ（nginx等）を配置し、' +
        'TRUSTED_PROXY_COUNT を適切に設定してください。',
      );
    }
    // x-real-ip はプロキシが上書きするヘッダーなので優先的に使う
    if (realIp) {
      const normalized = normalizeCandidateIp(realIp);
      if (normalized) return normalized;
    }
  }

  return null;
}

const APP_SESSION_COOKIE_NAME = process.env.APP_SESSION_COOKIE_NAME ?? 'app_session';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const requirement = getRequirement(request.nextUrl.pathname);

  let response = NextResponse.next({ request: { headers: request.headers } });

  let user = null;

  // updateSession は全ルートで呼び Cookie のリフレッシュを行う。
  // 内部で withAuthTimeout により Supabase 停止時は 3 秒で諦める。
  // ★ 未ログインユーザー（auth Cookie なし）の場合は、
  //   middleware.ts 内で getUser() をスキップするため一瞬で返る。
  try {
    const result = await updateSession(request);
    response = result.response;
    user = result.user;
  } catch (error) {
    logger.warn('[proxy] Supabase unavailable, running without authentication');
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

    return setSecurityHeaders(newResponse);
  };

  switch (requirement.kind) {
    // ----------------------------------------------------------------
    // ログイン必須ページ
    // 未ログイン → NOT_FOUND
    // ログイン済みだがロール不足 → NOT_FOUND
    // ----------------------------------------------------------------
    case 'login': {
      // Supabase Auth セッション または パスキー(app_session) Cookie のいずれかがあれば許可
      if (!user && !appSessionToken) {
        return setSecurityHeaders(NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url)));
      }

      // Supabase ユーザーがいる場合のみロールチェック
      // （パスキーユーザーはページコンポーネントの getCurrentActor() で権限検証）
      if (user && requirement.role) {
        if (requirement.role === 'admin' && !ADMIN_ROLES.includes(requestRole)) {
          return setSecurityHeaders(NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url)));
        }
        if (requirement.role === 'owner' && requestRole !== 'owner') {
          return setSecurityHeaders(NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url)));
        }
      }
      return setSecurityHeaders(createForwardResponse(response));
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
        return setSecurityHeaders(createForwardResponse(response));
      }

      // パスキー認証済みユーザー（app_session Cookie）も許可
      if (appSessionToken) {
        return setSecurityHeaders(createForwardResponse(response));
      }

      const editSessionToken = request.nextUrl.searchParams.get('session');
      if (editSessionToken) {
        return setSecurityHeaders(createForwardResponse(response));
      }

      return setSecurityHeaders(NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url)));
    }

    // ----------------------------------------------------------------
    // アカウント作成セッションページ
    // 既にログイン済み → HOME へリダイレクト
    // 有効なセッショントークン保持者 → 許可
    // 上記以外 → NOT_FOUND
    // ----------------------------------------------------------------
    case 'accountCreateSession': {
      if (user) {
        return setSecurityHeaders(NextResponse.redirect(new URL(PATHS.HOME, request.url)));
      }

      const accountSessionToken = request.nextUrl.searchParams.get('session');
      if (accountSessionToken) {
        return setSecurityHeaders(createForwardResponse(response));
      }

      return setSecurityHeaders(NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url)));
    }

    // ----------------------------------------------------------------
    // 存在しないページ
    // ----------------------------------------------------------------
    case 'notFound': {
      return setSecurityHeaders(NextResponse.redirect(new URL(PATHS.NOT_FOUND, request.url)));
    }

    // ----------------------------------------------------------------
    // 公開ルート
    // 認証不要で誰でもアクセス可能（/posts/[slug] など）
    // ----------------------------------------------------------------
    case 'public': {
      return setSecurityHeaders(createForwardResponse(response));
    }

    // ----------------------------------------------------------------
    // 上記のいずれにも該当しないルート
    // routeRules.ts で未定義のパスは public 相当として通過させる
    // → 新しいルート要件が追加された場合、ここで気付けるように
    //   console.warn を仕込んでおく
    // ----------------------------------------------------------------
    default: {
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[proxy] 未処理の route requirement for path: "${request.nextUrl.pathname}"`);
      }
      return setSecurityHeaders(createForwardResponse(response));
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
     * - favicon.ico / favicon/ (favicon files)
     * - vendor/ (vendor assets: toastui, etc.)
     * - public assets (images, fonts, scripts, styles, etc.)
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|favicon/|vendor/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|json|webmanifest|ico)$).*)',
  ],
};
