import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_VALUE } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page is always reachable
  if (pathname === '/admin/login') {
    // If already authed, bounce to dashboard
    if (req.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // Protect all other /admin pages
  if (pathname.startsWith('/admin')) {
    const authed = req.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
    if (!authed) {
      const url = new URL('/admin/login', req.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
