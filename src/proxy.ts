import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { getRequirement } from './lib/auth/routeRules'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request)
  const requirement = getRequirement(request.nextUrl.pathname)
  switch (requirement.kind) {

    case 'public':
      return response

    case 'login':
      if (!user) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      if (requirement.role) {
        const requestRole = user.app_metadata?.role
        if (requirement.role === 'admin' && !['admin', 'owner'].includes(requestRole)) {
          return NextResponse.redirect(new URL('/error/unauthorized', request.url))
        }
        if (requirement.role === 'owner' && requestRole !== 'owner') {
          return NextResponse.redirect(new URL('/error/unauthorized', request.url))
        }
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-role', requestRole);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
      return response

    case 'createAndEditPost':
      if (user && ['admin', 'owner'].includes(user.app_metadata?.role)) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-role', user.app_metadata?.role);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
      const editSessionToken = request.nextUrl.searchParams.get('session')
      if (editSessionToken) {
        return response
      }
      return NextResponse.redirect(new URL('/error/unauthorized', request.url))

    case 'accountCreateSession':
      if (user) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      const accountSessionToken = request.nextUrl.searchParams.get('session')
      if (accountSessionToken) {
        return response
      }
      return NextResponse.redirect(new URL('/error/unauthorized', request.url))

    default:
      return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

