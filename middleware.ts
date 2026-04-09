import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/games/:path*", "/consoles/:path*", "/settings/:path*"],
};
