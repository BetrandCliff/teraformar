"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, File, FileText, Files, LayoutGrid, Plus, Search, Table2, UploadCloud, X } from "lucide-react";
import { showToast } from "@/components/ToastProvider";

type DocumentRow = { id: string; name: string; category: string; file_url: string; file_size?: string; created_at?: string };

function fileType(document: DocumentRow) {
  const name = document.name || document.file_url;
  const extension = name.split(".").pop()?.split(/[?#]/)[0] ?? "FILE";
  return extension.length <= 5 ? extension.toUpperCase() : "FILE";
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    fetch("/api/documents").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load documents.");
      setDocs(data);
    }).catch((reason) => setStatus(reason instanceof Error ? reason.message : "Could not load documents."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => docs.filter((doc) => [doc.name, doc.category, doc.file_size, doc.file_url]
    .some((value) => value?.toLowerCase().includes(query.toLowerCase()))), [docs, query]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setStatus("Uploading document…");
    try {
      const formData = new FormData(form);
      formData.set("id", crypto.randomUUID());
      const response = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not upload document.");
      setDocs((items) => [data, ...items]);
      form.reset();
      setFileName("");
      setShowUpload(false);
      setStatus("");
      showToast("Document uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not upload document.";
      setStatus(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return <div className="admin-content">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-sm font-semibold text-[#147ee8]">Shared files</p><h1 className="mt-1 text-3xl font-black tracking-tight">Documents</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Store and organize project files, plans and resources in your shared library.</p></div>
      <button type="button" onClick={() => { setShowUpload((value) => !value); setStatus(""); }} className="btn btn-primary"><Plus size={17}/>{showUpload ? "Close upload" : "Upload document"}</button>
    </div>

    <div className="mt-7 flex flex-wrap gap-3"><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#147ee8]"><Files size={19}/></span><div><p className="text-xl font-black leading-none">{docs.length}</p><p className="mt-1 text-xs text-slate-500">Files in library</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><FileText size={19}/></span><div><p className="text-xl font-black leading-none">{new Set(docs.map((doc) => doc.category).filter(Boolean)).size}</p><p className="mt-1 text-xs text-slate-500">Categories</p></div></div></div>

    {showUpload && <form onSubmit={add} className="card mt-6 overflow-hidden border-blue-100">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:px-6"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#147ee8]"><UploadCloud size={20}/></span><div><h2 className="font-black">Add a document</h2><p className="mt-1 text-sm text-slate-500">Files up to 15 MB are saved in the site uploads folder.</p></div></div><button type="button" aria-label="Close upload form" onClick={() => setShowUpload(false)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200"><X size={18}/></button></div>
      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6"><label className="grid gap-2 text-sm font-semibold text-slate-700">Display name <span className="text-xs font-normal text-slate-400">Optional · defaults to the uploaded filename</span><input name="name" className="input" placeholder="e.g. Riverside Villa floor plan"/></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Category<input name="category" className="input" placeholder="e.g. Project plan, Contract, Reference"/></label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">Choose file<input required type="file" name="file" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} className="input"/><span className="text-xs font-normal text-slate-500">PDFs, documents and image files · 15 MB maximum</span>{fileName && <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#147ee8]"><File size={14}/>{fileName}</span>}</label>
        <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2"><p role="status" className="text-sm text-slate-500">{status}</p><button disabled={saving} className="btn btn-primary min-w-36 disabled:opacity-60"><UploadCloud size={16}/>{saving ? "Uploading…" : "Upload file"}</button></div>
      </div>
    </form>}

    <section className="card mt-7 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 md:p-5"><div><h2 className="font-black">Document library</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} {filtered.length === 1 ? "file" : "files"}{query ? " match your search" : " available"}</p></div><div className="flex flex-wrap gap-3"><label className="flex min-w-[210px] items-center gap-2 rounded-xl border border-slate-200 px-3"><Search size={15} className="shrink-0 text-slate-400"/><input aria-label="Search documents" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border-0 bg-transparent py-2.5 text-sm outline-none" placeholder="Search files…"/></label><div role="group" aria-label="Document view" className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"><button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === "cards" ? "bg-white text-[#147ee8] shadow-sm" : "text-slate-500"}`}><LayoutGrid size={15}/><span className="hidden sm:inline">Cards</span></button><button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === "table" ? "bg-white text-[#147ee8] shadow-sm" : "text-slate-500"}`}><Table2 size={15}/><span className="hidden sm:inline">Table</span></button></div></div></div>
      {status && !showUpload && <p role="alert" className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{status}</p>}
      {loading ? <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3"><div className="h-36 animate-pulse rounded-2xl bg-slate-100"/><div className="h-36 animate-pulse rounded-2xl bg-slate-100"/></div> : !filtered.length ? <div className="px-6 py-16 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#147ee8]"><Files size={23}/></span><h3 className="mt-4 font-black">{query ? "No matching files" : "No documents uploaded"}</h3><p className="mt-1 text-sm text-slate-500">{query ? "Try a different search term." : "Upload a file to start building your shared library."}</p>{!query && <button type="button" onClick={() => setShowUpload(true)} className="btn btn-primary mt-5"><Plus size={16}/>Upload your first file</button>}</div> : view === "cards" ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((doc) => <article key={doc.id} className="group rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"><div className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#147ee8]"><FileText size={21}/></span><div className="min-w-0 flex-1"><h3 className="break-words font-bold">{doc.name}</h3><p className="mt-1 text-xs text-slate-500">{doc.category || "Uncategorized"}</p></div><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{fileType(doc)}</span></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-400">{doc.file_size || "Shared file"}</span><a href={doc.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#147ee8] transition hover:bg-blue-50"><Download size={14}/>Open file</a></div></article>)}</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f4f7fb] text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">File size</th><th className="px-5 py-4">Action</th></tr></thead><tbody>{filtered.map((doc) => <tr key={doc.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50"><td className="px-5 py-4"><span className="flex items-center gap-3 font-semibold"><FileText size={18} className="text-[#147ee8]"/>{doc.name}</span></td><td className="px-5 py-4 text-slate-500">{doc.category || "Uncategorized"}</td><td className="px-5 py-4"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{fileType(doc)}</span></td><td className="px-5 py-4 text-slate-500">{doc.file_size || "—"}</td><td className="px-5 py-4"><a href={doc.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-[#147ee8] hover:underline"><Download size={15}/>Open</a></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
