// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    
    // Allow admin login page always
    if (pathname === "/admin/login") {
      return NextResponse.next()
    }
    
    // For ALL other admin routes
    if (pathname.startsWith("/admin")) {
      // Check if user has valid admin session
      if (!req.nextauth.token || req.nextauth.token.role !== "ADMIN") {
        // Redirect to admin login, NOT customer login
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // CRITICAL FIX: Always return true for admin routes
        // Let the middleware function handle the redirect logic
        if (pathname.startsWith("/admin")) {
          return true  // ← This prevents NextAuth from doing its own redirect
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}