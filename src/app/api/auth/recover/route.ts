import { NextResponse } from "next/server";
export async function POST(request: Request) {
  let body: { email?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Email is required" }, { status: 400 }); }
  if (!body.email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
  return NextResponse.json({ error: "Password resets are managed by the site administrator. Update this user's password_hash in the PostgreSQL users table." }, { status: 501 });
}
