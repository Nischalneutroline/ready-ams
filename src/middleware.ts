import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher(["/superadmin", "/"])
const isPublicRoute = createRouteMatcher(["/user"])

export default clerkMiddleware(
  async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
    const { nextUrl } = request
    const { userId } = await auth()
    if (isProtectedRoute(request) && !userId) {
      return NextResponse.redirect(new URL("/sign-in", nextUrl))
    }

    return NextResponse.next()
  }
)
