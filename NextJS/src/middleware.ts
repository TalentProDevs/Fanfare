import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET }); // "JWT_SECRET" and "jwt:{secret: process.env.JWT_SECRET}" in NextAuth options are same.
  const currentTime = Date.now(); // Current time in milliseconds

  // console.log("token...middle", token);

  if (
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/signup" ||
      req.nextUrl.pathname === "/forgot-password") &&
    token?.accessTokenExpires &&
    token?.accessTokenExpires > currentTime
  ) {
    // Protecting login, signup and forgot-password routes for authenticated user.
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check if the token exists
  if (
    req.nextUrl.pathname !== "/login" &&
    req.nextUrl.pathname !== "/signup" &&
    req.nextUrl.pathname !== "/forgot-password" &&
    (!token || token?.accessTokenExpires < currentTime)
  ) {
    // Redirect to sign-in for unauthenticated user.
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Continue the request if token exists
  return NextResponse.next();
}

// Middleware configuration
export const config = {
  // matcher: ["/"], // Specify the routes to protect
  matcher: ["/login", "/signup", "/forgot-password"], // Specify the routes to protect
};
