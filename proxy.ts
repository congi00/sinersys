import createMiddleware from 'next-intl/middleware';
import { routing } from './app/i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(it|en|de|fr)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};