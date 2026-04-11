import { NextResponse, type NextRequest } from "next/server";
import { getStackServerApp } from "./stack/server";

export async function middleware(request: NextRequest) {
  const stackServerApp = getStackServerApp();
  const user = await stackServerApp.getUser();

  const { pathname } = request.nextUrl;

  // Si el usuario no está autenticado y no está en una página pública,
  // lo redirigimos a la página de inicio de sesión.
  if (!user && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  // Si el usuario está autenticado y trata de acceder a las páginas de
  // inicio de sesión o registro, lo redirigimos al dashboard.
  if (user && (pathname.startsWith("/handler/sign-in") || pathname.startsWith("/handler/sign-up"))) {
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