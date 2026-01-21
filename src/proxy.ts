import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/guards";
import { getRequiredPermission } from "@/lib/auth/route-permissions";
import {
  DEFAULT_AUTHENTICATED_REDIRECT,
  NEXT_COOKIE_NAME,
  NEXT_QUERY_PARAM,
  resolveNextPath,
} from "@/lib/auth/redirects";
import { isPublicAsset, isPublicPathPrefix, isPublicRoute } from "@/lib/auth/routes";

const buildNextPath = (request: NextRequest) =>
  `${request.nextUrl.pathname}${request.nextUrl.search}`;

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname) || isPublicPathPrefix(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user ?? null;

  if (!user) {
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    const nextPath = buildNextPath(request);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(NEXT_QUERY_PARAM, nextPath);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(NEXT_COOKIE_NAME, nextPath, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return response;
  }

  if (pathname === "/login") {
    const nextFromQuery = resolveNextPath(
      request.nextUrl.searchParams.get(NEXT_QUERY_PARAM),
    );
    const nextFromCookie = resolveNextPath(
      request.cookies.get(NEXT_COOKIE_NAME)?.value,
    );
    const destination =
      nextFromQuery ?? nextFromCookie ?? DEFAULT_AUTHENTICATED_REDIRECT;

    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (pathname === "/forbidden") {
    return NextResponse.next();
  }

  const requiredPermission = getRequiredPermission(pathname);
  if (requiredPermission && !hasPermission(user.role ?? null, requiredPermission)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
