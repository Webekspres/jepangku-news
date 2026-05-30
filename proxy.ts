import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/profile', '/my-articles', '/submit-article', '/edit-article', '/bookmarks', '/points'];
const ADMIN_ROUTES = ['/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (!isAdminRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/my-articles/:path*',
    '/submit-article/:path*',
    '/edit-article/:path*',
    '/bookmarks/:path*',
    '/points/:path*',
    '/admin/:path*',
  ],
};
