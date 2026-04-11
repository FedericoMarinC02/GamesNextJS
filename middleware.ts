import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAMES = [
  "stack-auth-session",
  "stack-auth-session-token",
  "__Secure-stack-auth-session",
  "__Secure-stack-auth-session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const hasSessionCookie = AUTH_COOKIE_NAMES.some((cookieName) =>
    request.cookies.has(cookieName),
  );

  if (!hasSessionCookie && !isPublic) {
    return redirectToSignIn(request);
  }

  const response = NextResponse.next();

  if (!isPublic) {
    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate, max-age=0",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

function redirectToSignIn(request: NextRequest) {
  const signInUrl = new URL("/handler/sign-in", request.url);
  signInUrl.searchParams.set("redirect", request.nextUrl.pathname);

  const response = NextResponse.redirect(signInUrl);

  for (const cookieName of AUTH_COOKIE_NAMES) {
    response.cookies.delete(cookieName);
  }

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0",
  );

  return response;
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/handler") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/imgs")
  );
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
