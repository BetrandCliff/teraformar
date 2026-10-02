import { NextResponse } from "next/server";
import { typeormRequest } from "@/lib/typeorm";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/typeorm";

type Appointment = {
  id: string;
  name: string;
  email: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service?: string | null;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}

async function sendStatusEmail(
  appointment: Appointment,
  status: "confirmed" | "cancelled",
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from)
    return "Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.";

  const confirmed = status === "confirmed";
  const title = confirmed
    ? "Your appointment is confirmed"
    : "Your appointment has been cancelled";
  const service = appointment.service ? ` for ${appointment.service}` : "";
  const date = appointment.appointment_date;
  const time = appointment.appointment_time;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [appointment.email],
      subject: title,
      text: `Hello ${appointment.name},\n\n${confirmed ? "Your appointment is confirmed" : "Your appointment has been cancelled"}${service}.\nDate: ${date}\nTime: ${time}\n\n${confirmed ? "We look forward to speaking with you." : "Please contact us if you would like to arrange another time."}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><h1>${title}</h1><p>Hello ${escapeHtml(appointment.name)},</p><p>${confirmed ? "Your appointment is confirmed" : "Your appointment has been cancelled"}${escapeHtml(service)}.</p><p><strong>Date:</strong> ${escapeHtml(date)}<br/><strong>Time:</strong> ${escapeHtml(time)}</p><p>${confirmed ? "We look forward to speaking with you." : "Please contact us if you would like to arrange another time."}</p></div>`,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const details = await response.text();
    console.error("Appointment status email failed:", details);
    return "Status was updated, but the email could not be sent. Check the email provider configuration.";
  }
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get("buildvision_session")?.value;
  if (!(await isAdminAuthenticated(token)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid JSON object is required" },
      { status: 400 },
    );
  }
  if (
    !/^[0-9a-f-]{36}$/i.test(id) ||
    ![
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ].includes(String(body.status))
  ) {
    return NextResponse.json(
      { error: "A valid appointment ID and status are required" },
      { status: 400 },
    );
  }
  try {
    const previousRows = await typeormRequest<Appointment[]>("appointments", {
      query: `?id=eq.${encodeURIComponent(id)}&select=*`,
    });
    const previous = previousRows[0];
    if (!previous)
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    const rows = await typeormRequest<Appointment[]>("appointments", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}&select=*`,
      body: { status: String(body.status).toLowerCase() },
    });
    const appointment = rows[0];
    if (!appointment)
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );

    let emailWarning: string | null = null;
    if (
      appointment.status !== previous.status &&
      (appointment.status === "confirmed" || appointment.status === "cancelled")
    ) {
      try {
        emailWarning = await sendStatusEmail(appointment, appointment.status);
      } catch (error) {
        console.error("Appointment status email failed:", error);
        emailWarning =
          "Status was updated, but the email could not be sent. Check the email provider configuration.";
      }
    }
    return NextResponse.json({
      appointment,
      emailSent: !emailWarning,
      emailWarning,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update appointment",
      },
      { status: 503 },
    );
  }
}
