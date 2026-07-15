import createMiddleware from 'next-intl/middleware';
import { routing } from './app/i18n/routing';
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/7_Home") ||
    pathname.startsWith("/f/") ||
    pathname.startsWith("/2_Home") ||
    pathname === "/index.html"
   ) {
    return new NextResponse(null, { status: 410 });
   }

  return intlMiddleware(request);
}


export const config = {
  matcher: [
    "/",
    "/(it|en|de|fr)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/index.html",
    "/7_Home/:path*",
    "/2_Home/:path*",
    "/f/:path*",
    "/((?!api|_next|_vercel).*)",
  ],
};
