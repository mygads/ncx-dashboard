import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If the user is not signed in and the route is protected
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is signed in and trying to access auth pages
    if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has data source for protected dashboard routes
    if (session && req.nextUrl.pathname.startsWith("/dashboard")) {
      const allowedWithoutDataSource = [
        "/dashboard",
        "/dashboard/home",
        "/dashboard/profile",
        "/dashboard/data-management"
      ]

      const needsDataSource = !allowedWithoutDataSource.some(path => 
        req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path + "/")
      )

      if (needsDataSource) {
        // Check if user has an active data source
        const { data: dataSource } = await supabase
          .from('data_sources')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)
          .single()

        if (!dataSource) {
          // Redirect to home to set up data source
          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = "/dashboard/home"
          redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    // Redirect to home if accessing dashboard root
    if (session && req.nextUrl.pathname === "/dashboard") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard/home"
      return NextResponse.redirect(redirectUrl)
    }

  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error, we'll just continue to the requested page
    // This prevents authentication errors from blocking the entire site
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
