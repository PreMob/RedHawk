import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "redhawk_auth_token"

const protectedPrefixes = [
  "/dashboard",
  "/threats",
  "/vulnerabilities",
  "/assets",
  "/network",
  "/logs",
  "/reports",
  "/users",
  "/onbording",
]

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/login" && token) {
    const next = request.nextUrl.searchParams.get("next")
    const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/threats/:path*",
    "/vulnerabilities/:path*",
    "/assets/:path*",
    "/network/:path*",
    "/logs/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/onbording/:path*",
    "/login",
  ],
}
