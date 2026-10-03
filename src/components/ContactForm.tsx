"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { returnToPreviousSection } from "@/lib/form-navigation";
import { showToast } from "@/components/ToastProvider";

export default function ContactForm(){
  const [status,setStatus]=useState("");
  const router=useRouter();
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=event.currentTarget;setStatus("Sending…");
    try{
      const response=await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:crypto.randomUUID(),...Object.fromEntries(new FormData(form).entries())})});
      const result=await response.json();if(!response.ok)throw new Error(result.error??"Could not send the message");
      showToast("Message sent successfully.");form.reset();returnToPreviousSection(router,"/");
    }catch(error){const message=error instanceof Error?error.message:"Could not send the message. Please try again.";setStatus(message);showToast(message,"error")}
  }
  return <form onSubmit={submit} className="card p-6 md:p-8"><h2 className="text-2xl font-black">Send us a message</h2><div className="mt-6 grid gap-4 md:grid-cols-2"><input required name="name" className="input" placeholder="Full Name"/><input required type="email" name="email" className="input" placeholder="Email Address"/><input name="phone" className="input" placeholder="Phone Number"/><input name="project_type" className="input" placeholder="Project Type"/><textarea required name="message" className="input min-h-36 md:col-span-2" placeholder="Tell us about your project..."/></div><button className="btn btn-primary mt-5">Send Message</button>{status&&<p role="status" className="mt-4 text-sm text-slate-600">{status}</p>}</form>;
}
