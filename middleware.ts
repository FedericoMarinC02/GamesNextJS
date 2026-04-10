import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function middleware(request: NextRequest) {
  // Proteger rutas autenticadas
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/games") ||
    request.nextUrl.pathname.startsWith("/consoles") ||
    request.nextUrl.pathname.startsWith("/settings")
  ) {
    try {
      const user = await stackServerApp.getUser();

      if (!user) {
        return NextResponse.redirect(new URL("/handler/sign-in", request.url));
      }
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/handler/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/games/:path*", "/consoles/:path*", "/settings/:path*"],
};
