"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { showToast } from "@/components/ToastProvider";

export default function ForgotPassword() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setLoading(true);
    setStatus("Sending reset link…");
    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not send reset link.");
      const message = data.message ?? "Password reset instructions are unavailable.";
      setStatus(message);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not send reset link.";
      setStatus(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#f4f7fb] p-5"><div className="card w-full max-w-md p-8"><Link href="/admin/login" className="flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/>Back to sign in</Link><div className="mt-8 grid size-12 place-items-center rounded-xl bg-blue-50 text-[#147ee8]"><Mail/></div><h1 className="mt-5 text-3xl font-black">Reset your password</h1><p className="mt-3 text-sm leading-6 text-slate-500">Enter your administrator email. The site owner will update the password in cPanel.</p><form onSubmit={submit} className="mt-6 grid gap-4"><input required name="email" type="email" className="input" placeholder="admin@example.com"/><button disabled={loading} className="btn btn-primary">{loading ? "Submitting…" : "Request help"}</button></form>{status&&<p role="status" className="mt-4 text-sm text-slate-600">{status}</p>}</div></main>;
}
