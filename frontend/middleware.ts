import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic route protection for committee pages.
 * Full role verification also runs client-side in CommitteeGuard
 * because auth token lives in localStorage in the current frontend setup.
 * When you move tokens to httpOnly cookies, enforce role checks here using the cookie.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/committee')) {
    // Placeholder for cookie-based auth:
    // const token = request.cookies.get('madrasa_token')?.value
    // if (!token) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/committee/:path*'],
};
