import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // 🛡️ Whitelist approach — mặc định protect tất cả, chỉ cho public routes
  // Đã xóa /debug-env: defense-in-depth — page đã có NODE_ENV guard nhưng middleware thêm lớp bảo vệ
  const publicRoutes = ['/sign-in', '/sign-up', '/api/auth', '/auth']
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/sign-in') ||
    request.nextUrl.pathname.startsWith('/sign-up')

  // Chưa login + truy cập protected route → redirect về sign-in
  if (!isPublicRoute && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Đã login + truy cập auth route → redirect về devices
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/devices', request.url))
  }

  return response
}
