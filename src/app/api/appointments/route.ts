import { NextResponse } from "next/server";
import { typeormRequest } from "@/lib/typeorm";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/typeorm";
import { isUuid } from "@/lib/uuid";

export async function GET() {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!(await isAdminAuthenticated(token)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(
      await typeormRequest("appointments", {
        query: "?select=*&order=created_at.desc",
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load appointments",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid JSON object is required" },
      { status: 400 },
    );
  }
  if (
    !body ||
    !isUuid(body.id) ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.email !== "string" ||
    !body.email.includes("@")
  ) {
    return NextResponse.json(
      { error: "A valid UUID, name, and email are required" },
      { status: 400 },
    );
  }
  try {
    const rows = await typeormRequest<unknown[]>("appointments", {
      method: "POST",
      body: { ...body, id: body.id },
    });
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save appointment",
      },
      { status: 503 },
    );
  }
}
