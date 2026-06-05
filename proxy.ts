import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = [
  '/profile',
  '/my-articles',
  '/submit-article',
  '/edit-article',
  '/bookmarks',
  '/points',
];
const ADMIN_ROUTES = ['/admin'];

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestId = crypto.randomUUID();

  if (pathname.startsWith('/api/')) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'api.request',
        requestId,
        method: request.method,
        path: pathname + search,
        ip: getClientIp(request),
      }),
    );
    const response = NextResponse.next();
    response.headers.set('x-request-id', requestId);
    return response;
  }

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

  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAdminRoute) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
      );
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
    '/api/:path*',
    '/profile/:path*',
    '/my-articles/:path*',
    '/submit-article/:path*',
    '/edit-article/:path*',
    '/bookmarks/:path*',
    '/points/:path*',
    '/admin/:path*',
  ],
};
