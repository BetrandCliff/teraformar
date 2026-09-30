import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (["/admin/login", "/admin/forgot-password"].includes(pathname)) return NextResponse.next();
  const token = request.cookies.get("buildvision_session")?.value;
  if (await isAdminAuthenticated(token)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = { matcher: ["/admin/:path*"] };
