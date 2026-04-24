import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/verify-email";

  let isAuthenticated = false;
  let refreshedCookies: string | null = null;

  // ✅ Check access token
  if (accessToken) {
    try {
      jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY!);
      isAuthenticated = true;
    } catch {
      // expired → will try refresh
    }
  }

  // ✅ Only refresh if NOT authenticated
  if (!isAuthenticated && refreshToken) {
    try {
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/refresh`,
        {
          method: "GET",
          headers: {
            Cookie: `refreshToken=${refreshToken}`,
          },
        }
      );

      if (refreshRes.ok) {
        refreshedCookies = refreshRes.headers.get("set-cookie");
        isAuthenticated = true;
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }

  // ✅ Handle redirects
  if (isAuthenticated && isAuthPage) {
    const res = NextResponse.redirect(new URL("/", req.url));

    if (refreshedCookies) {
      res.headers.set("set-cookie", refreshedCookies);
    }

    return res;
  }

  if (isAuthenticated) {
    const res = NextResponse.next();

    if (refreshedCookies) {
      res.headers.set("set-cookie", refreshedCookies);
    }

    return res;
  }

  if (isAuthPage) return NextResponse.next();

  return NextResponse.redirect(new URL("/signin", req.url));
}
export const config = {
  matcher: [
    "/", 
    "/signup",
    "/signin",
    "/verify-email"
  ],
};