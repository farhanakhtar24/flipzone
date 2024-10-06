import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/util/auth";

const protectedRoutes = ["/middleware"];

export default async function middleware(request: NextRequest) {
	const session = await auth();

	const isProtected = protectedRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	if (isProtected && !session?.user) {
		const absoluteURL = new URL("/auth", request.nextUrl.origin);
		return NextResponse.redirect(absoluteURL.toString());
	}

	return NextResponse.next();
}
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
