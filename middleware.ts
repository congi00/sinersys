import createMiddleware from 'next-intl/middleware';
import { routing } from './app/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(it|en|de|fr)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
    // ... resto della CSP
  ].join('; ');
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', cspHeader);
  return response;
}