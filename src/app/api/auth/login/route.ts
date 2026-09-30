import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSession, typeormRequest } from "@/lib/typeorm";

type LoginUser = {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
};

export async function POST(request: Request) {
  if (!process.env.SESSION_SECRET)
    return NextResponse.json(
      { error: "Admin login is not configured" },
      { status: 503 },
    );
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }
  if (
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !body.email.trim() ||
    !body.password
  )
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  const email = body.email.trim().toLowerCase();
  let users: LoginUser[];
  try {
    users = await typeormRequest<LoginUser[]>("users", {
      query: `?select=id,email,password_hash,is_active&email=ilike.${encodeURIComponent(email)}&limit=1`,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the login database" },
      { status: 503 },
    );
  }

  const user = users[0];
  let passwordMatches = false;
  if (user?.is_active && user.password_hash) {
    try {
      passwordMatches = await bcrypt.compare(body.password, user.password_hash);
    } catch {
      passwordMatches = false;
    }
  }

  if (!user || !user.is_active || !passwordMatches)
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  const session = createAdminSession(user.email);
  const out = NextResponse.json({ ok: true });
  out.cookies.set("buildvision_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return out;
}
