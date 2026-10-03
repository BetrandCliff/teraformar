"use client";
import { FormEvent, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { returnToPreviousSection } from "@/lib/form-navigation";
import { showToast } from "@/components/ToastProvider";

export default function Booking() {
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = {
      id: crypto.randomUUID(),
      ...Object.fromEntries(new FormData(form).entries()),
    };
    setStatus("Sending your appointment request…");
    try {
      const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Request failed");
      setSent(true);
      form.reset();
      showToast("Appointment request submitted successfully.");
      returnToPreviousSection(router, "/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit the request. Please try again.";
      setStatus(message);
      showToast(message, "error");
    }
  }
  return <section className="min-h-[calc(100vh-140px)] bg-[#f4f7fb] py-14"><div className="container max-w-5xl"><div className="text-center"><div className="eyebrow">Schedule a consultation</div><h1 className="mt-2 text-4xl font-black">Book an Appointment</h1><p className="mt-3 text-slate-500">Choose a service, date and time that works for you.</p></div><div className="mt-10 grid gap-7 lg:grid-cols-[1fr_320px]"><form onSubmit={submit} className="card grid gap-5 p-6 md:grid-cols-2 md:p-8"><label className="grid gap-2 text-sm font-bold">Service<select name="service" required className="input">{["Architectural Design","Construction","3D Design","Renovation","Consultation"].map((x)=><option key={x}>{x}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Date<input required name="appointment_date" type="date" min={new Date().toISOString().slice(0,10)} className="input"/></label><label className="grid gap-2 text-sm font-bold">Time<select name="appointment_time" required className="input">{["09:00 AM","10:00 AM","11:00 AM","02:00 PM","03:00 PM","04:00 PM"].map((x)=><option key={x}>{x}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Project type<input name="project_type" className="input" placeholder="Home, office, renovation…"/></label><label className="grid gap-2 text-sm font-bold">Full name<input required name="name" className="input" placeholder="Your name"/></label><label className="grid gap-2 text-sm font-bold">Email address<input required type="email" name="email" className="input" placeholder="you@example.com"/></label><label className="grid gap-2 text-sm font-bold md:col-span-2">Phone number<input name="phone" className="input" placeholder="Phone number"/></label><label className="grid gap-2 text-sm font-bold md:col-span-2">Project details<textarea name="message" className="input min-h-28" placeholder="Tell us about your project…"/></label><button disabled={sent} className="btn btn-primary w-fit md:col-span-2"><CalendarDays size={17}/>{sent?"Request received":"Request appointment"}</button>{status&&<p role="status" className="text-sm text-slate-600 md:col-span-2">{status}</p>}</form><aside className="card h-fit p-6"><p className="font-black">Need help?</p><p className="mt-2 text-sm leading-6 text-slate-500">Call or WhatsApp our team if you need help choosing a service or appointment time.</p><p className="mt-4 text-sm font-bold">+237 6XX XXX XXX</p></aside></div></div></section>;
}
