import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("stack-auth-session-token");
  const { pathname } = request.nextUrl;

  // Si no hay cookie de sesión y no es una ruta pública, redirigir a sign-in.
  if (!sessionCookie && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  // Si hay cookie y el usuario intenta acceder a las páginas de login/registro,
  // redirigirlo al dashboard.
  if (sessionCookie && (pathname.startsWith("/handler/sign-in") || pathname.startsWith("/handler/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/handler") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/imgs") ||
    pathname === "/"
  );
}

export const config = {
  // El matcher define en qué rutas se ejecutará el middleware.
  // En este caso, se ejecutará en todas las rutas excepto las que
  // terminen en un punto (archivos estáticos).
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};