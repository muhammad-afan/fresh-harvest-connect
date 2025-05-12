import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define which paths are considered public
  const isPublicPath = path === "/login" || path === "/signup" || path === "/register";
  
  // Define farmer-only paths
  const isFarmerPath = path.startsWith("/farmer");
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Redirect to login if trying to access a protected route without being authenticated
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Check for farmer-only paths
  if (isFarmerPath && token?.role !== "FARMER") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Redirect to dashboard if already logged in and trying to access login page
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

// Specify which paths the middleware applies to
export const config = {
  matcher: ["/dashboard/:path*", "/farmer/:path*", "/login", "/signup", "/register"]
};
