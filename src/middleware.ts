import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Helper verify on Edge Runtime (middleware)
async function verify(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define guarded routes
  const isProtectedRoute = pathname.startsWith('/devices') || pathname === '/';
  const isAuthRoute = pathname.startsWith('/sign-in');

  // 2. Get token from cookies
  const token = request.cookies.get('token')?.value;

  // 3. Verify token
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production-please-make-it-long-and-secure';
  const payload = token ? await verify(token, secret) : null;
  const isAuthenticated = !!payload;

  // 4. Redirect logic
  // Nếu chưa Login và vào trang bảo vệ -> Redirect về sign-in
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Nếu đã Login và vào trang sign-in -> Redirect về trang chủ (devices)
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/devices', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
