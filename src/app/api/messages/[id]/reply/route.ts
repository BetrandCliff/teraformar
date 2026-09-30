import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated, typeormRequest } from "@/lib/typeorm";

type ClientMessage = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  project_type?: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!await isAdminAuthenticated(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });

  let body: { message?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "A valid JSON object is required" }, { status: 400 }); }
  if (typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Reply message is required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL." }, { status: 503 });
  }

  try {
    const rows = await typeormRequest<ClientMessage[]>("messages", { query: `?id=eq.${encodeURIComponent(id)}&select=id,name,email,subject,project_type` });
    const client = rows[0];
    if (!client) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    const topic = client.subject || client.project_type || "Website enquiry";
    const reply = body.message.trim();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [client.email],
        subject: `Re: ${topic}`,
        text: `Hello ${client.name},\n\n${reply}\n\n--- Original enquiry: ${topic} ---`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><p>Hello ${escapeHtml(client.name)},</p><p>${escapeHtml(reply).replace(/\n/g, "<br/>")}</p><hr/><p style="color:#64748b">Reply regarding: ${escapeHtml(topic)}</p></div>`,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Client message reply email failed:", await response.text());
      return NextResponse.json({ error: "Could not send email. Check the email provider configuration." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sentTo: client.email });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not send reply" }, { status: 503 });
  }
}
