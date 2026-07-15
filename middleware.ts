import createMiddleware from 'next-intl/middleware';
import { routing } from './app/i18n/routing';
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL("/it/", request.url),
      308
    );
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(it|en|de|fr)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
