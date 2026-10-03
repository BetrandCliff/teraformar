import { NextResponse } from "next/server";
import { typeormRequest } from "@/lib/typeorm";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/typeorm";
import { sendFormEmail } from "@/lib/mail";
import { isUuid } from "@/lib/uuid";

export async function GET() {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!await isAdminAuthenticated(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await typeormRequest("messages", { query: "?select=*&order=created_at.desc" })); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load messages" }, { status: 503 }); }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "A valid JSON object is required" }, { status: 400 }); }
  if (!body || !isUuid(body.id) || typeof body.name !== "string" || !body.name.trim() || typeof body.email !== "string" || !body.email.includes("@") || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "A valid UUID, name, email, and message are required" }, { status: 400 });
  }
  try {
    const fields = ["name", "email", "phone", "project_type", "message"] as const;
    const lines = fields.filter((field) => typeof body[field] === "string")
      .map((field) => `${field.replace("_", " ")}: ${String(body[field]).trim()}`);
    const rows = await typeormRequest<Record<string, unknown>[]>("messages", { method: "POST", body: { id: body.id, ...Object.fromEntries(fields.filter((field) => typeof body[field] === "string").map((field) => [field, String(body[field]).trim()])) } });
    await sendFormEmail("New website application", lines, body.email).catch(() => undefined);
    return NextResponse.json({ ok: true, message: rows[0] }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save message" }, { status: 503 }); }
}
