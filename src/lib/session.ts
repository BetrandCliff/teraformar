import { createHmac, timingSafeEqual } from "node:crypto";

export async function isAdminAuthenticated(token?: string) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  const [email, expires, signature] = token.split(".");
  if (!email || !expires || !signature || Number(expires) < Date.now()) return false;
  const expected = createHmac("sha256", secret).update(`${email}.${expires}`).digest("hex");
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const allowed = process.env.ADMIN_EMAILS?.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  return !allowed?.length || allowed.includes(Buffer.from(email, "base64url").toString("utf8").toLowerCase());
}
export function createAdminSession(email: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const encoded = Buffer.from(email.toLowerCase()).toString("base64url");
  const expires = String(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const signature = createHmac("sha256", secret).update(`${encoded}.${expires}`).digest("hex");
  return { token: `${encoded}.${expires}.${signature}`, maxAge: 7 * 24 * 60 * 60 };
}
