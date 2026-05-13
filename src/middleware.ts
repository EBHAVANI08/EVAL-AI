import { auth } from '@/auth';
import { NextResponse } from 'next/server';

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

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !req.auth) {
    const signInUrl = new URL('/', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
