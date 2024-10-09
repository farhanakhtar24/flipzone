import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { PAGE_ROUTES } from "./routes";

const protectedRoutes = [
  PAGE_ROUTES.CART,
  PAGE_ROUTES.CATEGORIES,
  PAGE_ROUTES.ORDERS,
  PAGE_ROUTES.PRODUCTS,
];

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request: NextRequest) {
  const session = await auth();

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtected && !session?.user) {
    const absoluteURL = new URL(PAGE_ROUTES.AUTH, request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
