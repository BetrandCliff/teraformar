"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, ImagePlus, Moon, Save, Sun, Trash2 } from "lucide-react";
import { uploadMedia } from "@/lib/upload-media";
import { showToast } from "@/components/ToastProvider";
import { ThemeMode, useAppTheme } from "@/components/ThemeProvider";

type Settings = { companyName: string; email: string; phone: string; location: string; logoImage: string; homeHeroImage: string; aboutImage: string; bannerImage: string; aboutTitle: string; aboutSubtitle: string; aboutStoryLabel: string; aboutStoryTitle: string; aboutStory: string; aboutStats: { value: string; label: string }[]; aboutValuesLabel: string; aboutValuesTitle: string; aboutValues: { title: string; description: string }[] };
const defaults: Settings = { companyName: "BuildVision", email: "hello@buildvision.cm", phone: "+237 6XX XXX XXX", location: "Buea, Cameroon", logoImage: "", homeHeroImage: "", aboutImage: "", bannerImage: "", aboutTitle: "About Us", aboutSubtitle: "Building dreams, creating lasting value.", aboutStoryLabel: "Our Story", aboutStoryTitle: "Construction with clarity from concept to completion.", aboutStory: "BuildVision is a construction and architectural design business focused on thoughtful planning, quality execution and modern visualization. Our approach combines practical construction knowledge with 3D design so clients can make confident decisions early.", aboutStats: [{ value: "100+", label: "Projects" }, { value: "50+", label: "Happy Clients" }, { value: "5+", label: "Years Experience" }, { value: "10+", label: "Professionals" }], aboutValuesLabel: "Our Values", aboutValuesTitle: "Principles behind every project.", aboutValues: [{ title: "Quality", description: "We make decisions with long-term value and client needs in mind." }, { title: "Integrity", description: "We communicate clearly and take responsibility for our work." }, { title: "Innovation", description: "We use thoughtful design and modern tools to solve real problems." }, { title: "Customer Focus", description: "We listen carefully and keep each client's goals at the center." }] };
type ImageKey = keyof Pick<Settings, "logoImage" | "homeHeroImage" | "aboutImage" | "bannerImage">;
const imageFields: [ImageKey, string, string, string][] = [
  ["logoImage", "Company logo", "logoImage_file", "Shown in the public header and footer."],
  ["homeHeroImage", "Homepage hero", "homeHeroImage_file", "Wide image displayed at the top of the homepage."],
  ["aboutImage", "About page", "aboutImage_file", "Main image shown in the About section."],
  ["bannerImage", "Page banner", "bannerImage_file", "Shared banner used across inner pages."],
];
const defaultImages: Record<ImageKey, string> = {
  logoImage: "",
  homeHeroImage: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2000&q=85",
  aboutImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  bannerImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=80",
};

function ThemeChoice({ label, value, selected, onSelect }: { label: string; value: ThemeMode; selected: ThemeMode; onSelect: (value: ThemeMode) => void }) {
  const Icon = value === "dark" ? Moon : Sun;
  return <button type="button" onClick={() => onSelect(value)} aria-pressed={selected === value} className={`flex min-h-24 items-center gap-3 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected === value ? "border-[#147ee8] bg-blue-50/70 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}>
    <span className={`grid size-10 place-items-center rounded-lg ${value === "dark" ? "bg-slate-800 text-white" : "bg-amber-50 text-amber-600"}`}><Icon size={19}/></span>
    <span><span className="block font-bold">{label}</span><span className="mt-1 block text-xs text-slate-500">{value === "dark" ? "Low-light surfaces" : "Bright, clean surfaces"}</span></span>
    {selected === value && <span className="ml-auto size-2 rounded-full bg-[#147ee8]"/>}
  </button>;
}

export default function SettingsPage() {
  const [values, setValues] = useState(defaults);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const { websiteTheme, adminTheme, setTheme } = useAppTheme();

  useEffect(() => {
    fetch("/api/settings").then(async (response) => {
      if (response.ok) setValues({ ...defaults, ...await response.json() });
    }).catch(() => setStatus("Could not load settings."));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    let updated = { ...values };
    setSaving(true);
    try {
      for (const [field, label, inputName] of imageFields) {
        const input = form.elements.namedItem(inputName) as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
          setStatus(`Uploading ${label.toLowerCase()} image…`);
          updated = { ...updated, [field]: await uploadMedia(file, "site") };
          input.value = "";
        }
      }
      setStatus("Saving company settings…");
      const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save settings.");
      setValues(updated);
      setStatus("Settings saved successfully.");
      showToast("Settings saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save settings.";
      setStatus(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return <div className="admin-content">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold text-[#147ee8]">Workspace preferences</p><h1 className="mt-1 text-3xl font-black tracking-tight">Settings</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage the information shown to visitors, update site imagery, and choose how the website and admin workspace look.</p></div>
      <button form="settings-form" disabled={saving} className="btn btn-primary"><Save size={17}/>{saving ? "Saving…" : "Save changes"}</button>
    </div>

    <form id="settings-form" onSubmit={save} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div className="grid content-start gap-6">
        <section className="card admin-settings-card p-6 md:p-7">
          <div className="mb-6 flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#147ee8]">01</span><div><h2 className="text-lg font-black">Company information</h2><p className="mt-1 text-sm text-slate-500">These details are displayed in public contact areas.</p></div></div>
          <div className="grid gap-5 md:grid-cols-2">{([ ["companyName", "Company name", "text"], ["email", "Contact email", "email"], ["phone", "Phone number", "tel"], ["location", "Office location", "text"] ] as const).map(([key, label, type]) => <label key={key} className="grid gap-2 text-sm font-semibold text-slate-700">{label}<input type={type} className="input" value={values[key]} onChange={(event) => setValues((previous) => ({ ...previous, [key]: event.target.value }))}/></label>)}</div>
        </section>

        <section className="card admin-settings-card p-5 md:p-7">
          <div className="mb-6 flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">02</span><div><h2 className="text-lg font-black">About page content</h2><p className="mt-1 text-sm text-slate-500">Edit the public About page text, statistics and values. Changes appear after saving.</p></div></div>
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Page title<input className="input" value={values.aboutTitle} onChange={(event) => setValues((previous) => ({ ...previous, aboutTitle: event.target.value }))}/></label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Page introduction<input className="input" value={values.aboutSubtitle} onChange={(event) => setValues((previous) => ({ ...previous, aboutSubtitle: event.target.value }))}/></label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Our story label<input className="input" value={values.aboutStoryLabel} onChange={(event) => setValues((previous) => ({ ...previous, aboutStoryLabel: event.target.value }))}/></label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Our story heading<input className="input" value={values.aboutStoryTitle} onChange={(event) => setValues((previous) => ({ ...previous, aboutStoryTitle: event.target.value }))}/></label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Our story<textarea rows={5} className="input resize-y" value={values.aboutStory} onChange={(event) => setValues((previous) => ({ ...previous, aboutStory: event.target.value }))}/></label>
            <div><h3 className="mb-3 text-sm font-bold">Statistics</h3><div className="grid gap-3 sm:grid-cols-2">{values.aboutStats.map((stat, index) => <div key={index} className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3"><label className="grid gap-2 text-xs font-semibold text-slate-600">Number<input className="input" value={stat.value} onChange={(event) => setValues((previous) => ({ ...previous, aboutStats: previous.aboutStats.map((item, i) => i === index ? { ...item, value: event.target.value } : item) }))}/></label><label className="grid gap-2 text-xs font-semibold text-slate-600">Label<input className="input" value={stat.label} onChange={(event) => setValues((previous) => ({ ...previous, aboutStats: previous.aboutStats.map((item, i) => i === index ? { ...item, label: event.target.value } : item) }))}/></label></div>)}</div></div>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Values section label<input className="input" value={values.aboutValuesLabel} onChange={(event) => setValues((previous) => ({ ...previous, aboutValuesLabel: event.target.value }))}/></label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Values section heading<input className="input" value={values.aboutValuesTitle} onChange={(event) => setValues((previous) => ({ ...previous, aboutValuesTitle: event.target.value }))}/></label>
            <div><h3 className="mb-3 text-sm font-bold">Company values</h3><div className="grid gap-4">{values.aboutValues.map((value, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4"><label className="grid gap-2 text-xs font-semibold text-slate-600">Value title<input className="input" value={value.title} onChange={(event) => setValues((previous) => ({ ...previous, aboutValues: previous.aboutValues.map((item, i) => i === index ? { ...item, title: event.target.value } : item) }))}/></label><label className="grid gap-2 text-xs font-semibold text-slate-600">Description<textarea rows={2} className="input resize-y" value={value.description} onChange={(event) => setValues((previous) => ({ ...previous, aboutValues: previous.aboutValues.map((item, i) => i === index ? { ...item, description: event.target.value } : item) }))}/></label></div>)}</div></div>
          </div>
        </section>

        <section className="card admin-settings-card p-6 md:p-7">
          <div className="mb-6 flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><ImagePlus size={19}/></span><div><h2 className="text-lg font-black">Website imagery</h2><p className="mt-1 text-sm text-slate-500">Upload images to the website uploads folder for key sections.</p></div></div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{imageFields.map(([key, label, inputName, description]) => <div key={key} className="group grid content-start gap-3 text-sm font-semibold text-slate-700"><span>{label}</span><span className="text-xs font-normal leading-5 text-slate-500">{description}</span><input name={inputName} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="input text-xs" onChange={(event) => { const file = event.target.files?.[0]; if (file) setValues((previous) => ({ ...previous, [key]: URL.createObjectURL(file) })); }}/>{values[key] ? <img src={values[key]} alt={`${label} preview`} className={`h-36 w-full rounded-xl border border-slate-200 bg-white transition group-hover:shadow-md ${key === "logoImage" ? "object-contain p-2" : "object-cover"}`}/> : key === "logoImage" ? <div className="grid h-36 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"><Building2 size={32}/><span className="text-xs">Default logo mark</span></div> : <img src={defaultImages[key]} alt={`${label} default preview`} className="h-36 w-full rounded-xl border border-slate-200 object-cover transition group-hover:shadow-md"/>}{values[key] && <button type="button" onClick={async (event) => { const button = event.currentTarget; button.disabled = true; const card = button.closest("div.group"); const input = card?.querySelector(`input[name="${inputName}"]`) as HTMLInputElement | null; const cleared = { ...values, [key]: "" }; try { const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: "" }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Could not remove image."); if (input) input.value = ""; setValues({ ...defaults, ...result, ...cleared }); setStatus(`${label} removed. The default image is now in use.`); showToast(`${label} removed. Default image restored.`); } catch (error) { const message = error instanceof Error ? error.message : "Could not remove image."; setStatus(message); showToast(message, "error"); } finally { button.disabled = false; } }} className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"><Trash2 size={14}/>Remove image</button>}</div>)}</div>
        </section>
      </div>

      <aside className="grid content-start gap-6">
        <section className="card admin-settings-card p-6"><div><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">Appearance</p><h2 className="mt-1 text-lg font-black">Themes</h2><p className="mt-1 text-sm leading-6 text-slate-500">Choose separate display modes for visitors and the admin workspace. Changes apply immediately.</p></div>
          <div className="mt-6"><h3 className="mb-3 text-sm font-bold">Website theme</h3><div className="grid gap-3"><ThemeChoice label="Light" value="light" selected={websiteTheme} onSelect={(mode) => setTheme("website", mode)}/><ThemeChoice label="Dark" value="dark" selected={websiteTheme} onSelect={(mode) => setTheme("website", mode)}/></div></div>
          <div className="mt-6"><h3 className="mb-3 text-sm font-bold">Admin theme</h3><div className="grid gap-3"><ThemeChoice label="Light" value="light" selected={adminTheme} onSelect={(mode) => setTheme("admin", mode)}/><ThemeChoice label="Dark" value="dark" selected={adminTheme} onSelect={(mode) => setTheme("admin", mode)}/></div></div>
        </section>
        <section className="rounded-2xl bg-[#081a2c] p-6 text-white shadow-lg shadow-slate-900/10"><p className="text-sm font-bold">Changes apply across pages</p><p className="mt-2 text-sm leading-6 text-slate-300">Your theme choices are saved in this browser. Company details and images are saved to the connected database and storage bucket.</p></section>
      </aside>
    </form>
    {status && <p role="status" className="mt-5 text-sm text-slate-500">{status}</p>}
  </div>;
}
