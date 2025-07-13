import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ar'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for _next, api, favicon, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Rewrite locale-prefixed static assets to root
  // Handle /en/slide1.webp -> /slide1.webp
  if (pathname.match(/^\/(en|ar)\/(.*\.(webp|png|jpg|jpeg|svg|gif|ico|css|js|json))$/)) {
    const rewrittenPath = pathname.replace(/^\/(en|ar)/, '');
    return NextResponse.rewrite(
      new URL(rewrittenPath, request.url)
    );
  }

  // Rewrite locale-prefixed translation files
  // Handle /en/locales/en/common.json -> /locales/en/common.json
  if (pathname.match(/^\/(en|ar)\/locales\//)) {
    const rewrittenPath = pathname.replace(/^\/(en|ar)/, '');
    return NextResponse.rewrite(
      new URL(rewrittenPath, request.url)
    );
  }

  // Check if the pathname has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), API, favicon, locales, and static assets
    '/((?!_next|api|favicon.ico|locales).*)',
  ],
}; 