import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isAdminAuthenticated } from "@/lib/session";

export const runtime = "nodejs";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "model/gltf-binary", "model/gltf+json", "application/octet-stream", "application/pdf"]);
export async function POST(request: Request) {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!(await isAdminAuthenticated(token))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") ?? "");
    if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose a file to upload" }, { status: 400 });
    const ext = path.extname(file.name).toLowerCase();
    const valid = allowedTypes.has(file.type) && ((file.type.startsWith("image/") && ext !== ".svg") || (ext === ".pdf" && file.type === "application/pdf") || ([".glb", ".gltf"].includes(ext) && ["model/gltf-binary", "model/gltf+json", "application/octet-stream"].includes(file.type)));
    if (!valid || !["projects", "designs", "site"].includes(kind)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "Files must be 100 MB or smaller" }, { status: 413 });
    const safeName = path.basename(file.name).normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
    const folder = path.join(process.cwd(), "public", "uploads", kind);
    await mkdir(folder, { recursive: true });
    const filename = `${randomUUID()}-${safeName}`;
    await writeFile(path.join(folder, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    return NextResponse.json({ publicUrl: `/uploads/${kind}/${filename}` }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save uploaded file" }, { status: 500 });
  }
}
