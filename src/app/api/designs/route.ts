import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated, typeormRequest } from "@/lib/typeorm";
import { toDesign } from "@/lib/projects";
type DesignRow = {
    id: string;
    slug: string;
    title: string;
    data: Record<string, unknown>;
};
export async function GET() {
    try {
        const rows = await typeormRequest<DesignRow[]>("designs", {
            query: "?select=*&order=created_at.desc",
        });
        return NextResponse.json(
            rows.map(toDesign),
        );
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not load designs",
            },
            { status: 503 },
        );
    }
}
export async function POST(request: Request) {
    const token = (await cookies()).get("buildvision_session")?.value;
    if (!(await isAdminAuthenticated(token)))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        const rows = await typeormRequest<DesignRow[]>("designs", {
            method: "POST",
            body: { slug, title: data.title, data },
        });
        const row = rows[0];
        return NextResponse.json(
            { ...row.data, id: row.id, slug: row.slug, title: row.title },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not save design",
            },
            { status: 503 },
        );
    }
}
