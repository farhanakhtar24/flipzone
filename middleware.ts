import { NextRequest, NextResponse } from "next/server";
import { PAGE_ROUTES } from "./routes";
import { auth } from "./auth";

const protectedRoutes = [
  PAGE_ROUTES.CART,
  PAGE_ROUTES.CATEGORIES,
  PAGE_ROUTES.ORDERS,
  PAGE_ROUTES.PRODUCTS,
];

export default async function middleware(request: NextRequest) {
  const session = await auth();

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtected && !session?.user) {
    const absoluteURL = new URL(PAGE_ROUTES.AUTH, request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
