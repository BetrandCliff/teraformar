import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated, typeormRequest } from "@/lib/typeorm";
export async function GET() {
    try {
        const rows = await typeormRequest<{ data: Record<string, unknown> }[]>(
            "site_settings",
            { query: "?id=eq.1&select=data" },
        );
        return NextResponse.json(rows[0]?.data ?? {}, {
            headers: { "Cache-Control": "no-store, max-age=0" },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not load settings",
            },
            { status: 503 },
        );
    }
}
export async function PATCH(request: Request) {
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
    try {
        const existing = await typeormRequest<{ data: Record<string, unknown> }[]>(
            "site_settings",
            { query: "?id=eq.1&select=data" },
        );
        const mergedData = { ...(existing[0]?.data ?? {}), ...data };
        const rows = await typeormRequest<{ data: Record<string, unknown> }[]>(
            "site_settings",
            {
                method: "POST",
                query: "?on_conflict=id",
                body: { id: 1, data: mergedData, updated_at: new Date().toISOString() },
                prefer: "resolution=merge-duplicates,return=representation",
            },
        );
        revalidatePath("/", "layout");
        return NextResponse.json(rows[0]?.data ?? mergedData, {
            headers: { "Cache-Control": "no-store, max-age=0" },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not save settings",
            },
            { status: 503 },
        );
    }
}
