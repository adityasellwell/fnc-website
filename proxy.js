import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/account", "/checkout", "/orders", "/admin"];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const session = request.cookies.get("fnc_session")?.value;
    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = NextResponse.next();

  // Prevent web host reverse proxies (Hostinger/Apache/Nginx) from caching
  // React Server Component (RSC) flight payloads and serving raw text to browsers.
  response.headers.set("Vary", "RSC, Next-Router-State-Tree, Next-Url, Accept");

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/account")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)).*)",
  ],
};
