import createMiddleware from "next-intl/middleware";
import { routing } from "./app/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Homepage neutra
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL("/it/", request.url),
      308
    );
  }

  // Vecchi URL eliminati
  if (
    pathname === "/index.html" ||
    pathname.startsWith("/7_Home") ||
    pathname.startsWith("/2_Home") ||
    pathname.startsWith("/f/")
  ) {
    return new NextResponse(null, { status: 410 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(it|en|de|fr)/:path*",
    "/((?!api|_next|.*\\..*|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};