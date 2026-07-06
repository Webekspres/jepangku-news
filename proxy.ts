import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { logRequestStart, getClientIp, generateReqId } from '@/lib/logging/request-logger';

/** Hanya rute profil milik sendiri yang wajib login; `/profile/[username]` publik. */
function isPrivateProfileRoute(pathname: string): boolean {
    return pathname === '/profile' || pathname.startsWith('/profile/edit');
}

const CLERK_PROTECTED_ROUTES = createRouteMatcher([
    '/my-articles(.*)',
    '/submit-article(.*)',
    '/edit-article(.*)',
    '/bookmarks(.*)',
    '/activity(.*)',
    '/points(.*)',
    '/profile/edit(.*)',
    '/admin(.*)',
]);

function logApiRequest(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const reqId = generateReqId();

    logRequestStart({
        reqId,
        method: request.method,
        path: pathname + search,
        ip: getClientIp(request),
        userAgent: request.headers.get('user-agent') ?? undefined,
    });

    const response = NextResponse.next();
    response.headers.set('x-request-id', reqId);
    return response;
}

const clerk = clerkMiddleware(async (auth, request) => {
    const { pathname, search } = request.nextUrl;

    if (pathname.startsWith('/api/')) {
        return logApiRequest(request);
    }

    const needsAuth =
        CLERK_PROTECTED_ROUTES(request) ||
        isPrivateProfileRoute(pathname);

    if (needsAuth) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect_url', pathname + search);
        await auth.protect({ unauthenticatedUrl: signInUrl.href });
    }

    return NextResponse.next();
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
    // Some users still arrive with stale cross-subdomain Clerk handshakes
    // from old instances; drop the param and continue a clean auth flow.
    if (request.nextUrl.searchParams.has('__clerk_handshake')) {
        const cleanUrl = request.nextUrl.clone();
        cleanUrl.searchParams.delete('__clerk_handshake');
        return NextResponse.redirect(cleanUrl);
    }

    return clerk(request, event);
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
        '/__clerk/(.*)',
    ],
};
