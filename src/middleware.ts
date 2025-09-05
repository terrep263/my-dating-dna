import { NextRequest, NextResponse } from "next/server";
export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;
  const refCode = searchParams.get("ref");
  
  // Only process if there's a ref parameter
  if (refCode) {
    try {
      // Set the affiliate cookie (180 days = 15552000 seconds)
      const response = NextResponse.next();
      response.cookies.set("aff_code", refCode.toUpperCase(), {
        maxAge: 15552000, // 180 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      // Log the click via API call (non-blocking)
      const clientIP = request.headers.get("x-forwarded-for") || 
        request.headers.get("x-real-ip") || 
        "unknown";
      
      const userAgent = request.headers.get("user-agent") || "unknown";

      // Fire and forget API call to log the click
      fetch(`${request.nextUrl.origin}/api/track-affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affiliateCode: refCode.toUpperCase(),
          url: pathname,
          ip: clientIP,
          userAgent: userAgent,
        }),
      }).catch(err => {
        console.error("[MIDDLEWARE] Failed to log affiliate click:", err);
      });

      return response;
      
    } catch (error) {
      console.error("[MIDDLEWARE] Affiliate tracking error:", error);
      // Continue with normal request even if tracking fails
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except API routes and static files
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

// Try without edge runtime
// export const runtime = 'edge';