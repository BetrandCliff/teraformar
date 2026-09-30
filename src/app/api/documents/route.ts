import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isAdminAuthenticated, typeormRequest } from "@/lib/typeorm";

export const runtime = "nodejs";
export async function GET() {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!(await isAdminAuthenticated(token))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await typeormRequest("documents", { query: "?select=*&order=created_at.desc" })); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load documents" }, { status: 503 }); }
}
export async function POST(request: Request) {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!(await isAdminAuthenticated(token))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let storedPath: string | undefined;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose a file to upload" }, { status: 400 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "Files must be 15 MB or smaller" }, { status: 413 });
    const name = String(form.get("name") || file.name).trim();
    const category = String(form.get("category") || "Project document");
    const ext = path.extname(file.name).toLowerCase();
    if (!name || ![".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".jpg", ".jpeg", ".png"].includes(ext)) return NextResponse.json({ error: "Unsupported document file" }, { status: 400 });
    const folder = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(folder, { recursive: true });
    const filename = `${randomUUID()}-${path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120)}`;
    storedPath = path.join(folder, filename);
    await writeFile(storedPath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    const rows = await typeormRequest<Record<string, unknown>[]>("documents", { method: "POST", body: { name, category, file_url: `/uploads/documents/${filename}`, file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB` } });
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (storedPath) { const { unlink } = await import("node:fs/promises"); await unlink(storedPath).catch(() => {}); }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not upload document" }, { status: 503 });
  }
}
