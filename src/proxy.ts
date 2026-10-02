import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("buildvision_session")?.value;
  const authenticated = await isAdminAuthenticated(token);
  if (pathname === "/admin/login") {
    if (authenticated) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }
  if (pathname === "/admin/forgot-password") return NextResponse.next();
  if (authenticated) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*"] };
