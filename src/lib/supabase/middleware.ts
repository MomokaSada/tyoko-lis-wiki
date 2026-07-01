import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { withAuthTimeout } from '@/lib/supabaseAuthTimeout'

/**
 * Supabase Auth のセッションCookie名に使われるプロジェクト参照。
 * Cookie 名は `sb-{PROJECT_REF}-auth-token` の形式。
 */
function getSupabaseProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  try {
    const hostname = new URL(url).hostname // e.g. "lcnnrtfegylttxxabfex.supabase.co"
    return hostname.split('.')[0] ?? null
  } catch {
    return null
  }
}

/** Supabase Auth のセッションCookieが存在するかチェックする */
function hasAuthSessionCookie(request: NextRequest): boolean {
  const ref = getSupabaseProjectRef()
  if (!ref) return false
  // @supabase/ssr は `sb-{ref}-auth-token` という名前でCookieを保存する
  return request.cookies.has(`sb-${ref}-auth-token`)
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  // ★ 最適化: Supabase Auth のセッションCookieがなければ getUser() を呼ばない
  //   未ログインユーザー（＝大多数の訪問者）では HTTP リクエストがまったく飛ばなくなる。
  //   ただし Cookie のリフレッシュ（setAll）は Supabase クライアント生成時に
  //   透過的に処理されるため、Cookie が存在する場合は通常通り getUser() を呼ぶ。
  if (!hasAuthSessionCookie(request)) {
    return { response, user: null }
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  let user = null
  try {
    const result = await withAuthTimeout(supabase.auth.getUser())
    user = result.data.user
  } catch (error) {
    console.warn('[supabase] Auth unavailable, proceeding without authentication')
  }

  return { response, user }
}
