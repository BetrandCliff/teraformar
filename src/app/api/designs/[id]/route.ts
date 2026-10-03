import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated, typeormRequest } from "@/lib/typeorm";
import { isUuid } from "@/lib/uuid";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!(await isAdminAuthenticated(token)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id))
    return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid JSON object is required" },
      { status: 400 },
    );
  }
  if (!data || typeof data.title !== "string" || !data.title.trim())
    return NextResponse.json(
      { error: "Design name is required" },
      { status: 400 },
    );

  const slug =
    typeof data.slug === "string" && data.slug
      ? data.slug
      : data.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
  try {
    const rows = await typeormRequest<Record<string, unknown>[]>("designs", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`,
      body: { title: data.title, slug, data },
    });
    if (!rows.length)
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update design",
      },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!(await isAdminAuthenticated(token)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id))
    return NextResponse.json({ error: "Invalid design ID" }, { status: 400 });

  try {
    const rows = await typeormRequest<Record<string, unknown>[]>("designs", {
      method: "DELETE",
      query: `?id=eq.${encodeURIComponent(id)}`,
    });
    if (!rows.length)
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete design",
      },
      { status: 503 },
    );
  }
}
