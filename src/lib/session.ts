import { createHmac, timingSafeEqual } from "node:crypto";

export async function isAdminAuthenticated(token?: string) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  const [email, expires, signature] = token.split(".");
  if (!email || !expires || !signature || Number(expires) < Date.now()) return false;
  const expected = createHmac("sha256", secret).update(`${email}.${expires}`).digest("hex");
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  // The login API only issues this signed cookie after validating an active
  // PostgreSQL user. An old ADMIN_EMAILS allowlist would reject valid DB users.
  return true;
}
export function createAdminSession(email: string, rememberMe = false) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const encoded = Buffer.from(email.toLowerCase()).toString("base64url");
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 12 * 60 * 60;
  const expires = String(Date.now() + maxAge * 1000);
  const signature = createHmac("sha256", secret).update(`${encoded}.${expires}`).digest("hex");
  return { token: `${encoded}.${expires}.${signature}`, maxAge, rememberMe };
}
