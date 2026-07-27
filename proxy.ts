import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "bayan_admin_session";

const protectedPrefixes = [
  "/admin",
  "/learn",
  "/newsletters",
  "/parent",
  "/student",
  "/arabic-a",
  "/arabic-b",
  "/achievements",
  "/events",
  "/gallery",
  "/magazine",
  "/resources",
  "/creativity",
  "/newsletter",
  "/studio",
  "/students",
  "/parents",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME)?.value;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // التحقق المشفّر الكامل يحدث داخل ProtectedLayout بواسطة Firebase Admin.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/learn/:path*",
    "/newsletters/:path*",
    "/parent/:path*",
    "/student/:path*",
    "/arabic-a/:path*",
    "/arabic-b/:path*",
    "/achievements/:path*",
    "/events/:path*",
    "/gallery/:path*",
    "/magazine/:path*",
    "/resources/:path*",
    "/creativity/:path*",
    "/newsletter/:path*",
    "/studio/:path*",
    "/students/:path*",
    "/parents/:path*",
  ],
};
