import { createHmac, timingSafeEqual } from "node:crypto";

function readAdminSession(token?: string): { id: string; email: string } | null {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return null;
  const [identity, expires, signature] = token.split(".");
  if (!identity || !expires || !signature || Number(expires) < Date.now()) return null;
  const expected = createHmac("sha256", secret).update(`${identity}.${expires}`).digest("hex");
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const user = JSON.parse(Buffer.from(identity, "base64url").toString("utf8"));
    if (typeof user.id !== "string" || typeof user.email !== "string") return null;
    return user;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(token?: string) {
  return readAdminSession(token) !== null;
}

export function getAdminIdFromSession(token?: string): string | null {
  return readAdminSession(token)?.id ?? null;
}

export function createAdminSession(id: string, email: string, rememberMe = false) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const encoded = Buffer.from(JSON.stringify({ id, email: email.toLowerCase() })).toString("base64url");
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 12 * 60 * 60;
  const expires = String(Date.now() + maxAge * 1000);
  const signature = createHmac("sha256", secret).update(`${encoded}.${expires}`).digest("hex");
  return { token: `${encoded}.${expires}.${signature}`, maxAge, rememberMe };
}
