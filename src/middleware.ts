import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware runs in the Edge runtime — no Node.js modules allowed.
 * We check only for the NextAuth session cookie here.
 * Full JWT verification happens in API routes / server components via auth() from auth.ts.
 */

const PROTECTED_ROUTES = [
  '/teacher-dashboard',
  '/student-dashboard',
  '/admin-dashboard',
  '/answer-sheet-evaluator',
  '/question-paper-analyzer',
  '/answer-generator',
  '/diagram-analyzer',
  '/multilingual-engine',
  '/students',
  '/question-papers',
  '/analytics',
  '/settings',
];

// NextAuth v5 stores the session in one of these cookies
const SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtected) {
    const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
    if (!hasSession) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
