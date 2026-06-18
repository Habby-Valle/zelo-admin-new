import { NextRequest, NextResponse } from "next/server"
import { decodeJwt, isTokenExpired } from "@/lib/jwt"

const PROTECTED_PATHS = [
  "/dashboard",
  "/clinics",
  "/users",
  "/patients",
  "/checklists",
  "/plans",
  "/subscriptions",
  "/payments",
  "/shifts",
  "/sos",
  "/reports",
  "/audit-logs",
  "/feedback",
  "/broadcast",
  "/settings",
]

const AUTH_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/accept-invitation",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (!isProtected && !isAuth) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get("ze_access")?.value

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (accessToken) {
    const payload = decodeJwt(accessToken)

    if (!payload || isTokenExpired(payload)) {
      const refreshToken = request.cookies.get("ze_refresh")?.value
      if (refreshToken && isProtected) {
        const refreshUrl = new URL("/api/auth/refresh", request.url)
        refreshUrl.searchParams.set("from", pathname)
        return NextResponse.redirect(refreshUrl)
      }
      if (isProtected) {
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("ze_access")
        return response
      }
      return NextResponse.next()
    }

    if (isProtected && payload.role !== "super_admin") {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
