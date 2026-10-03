"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Eye, LayoutGrid, MapPin, Pencil, Table2, Trash2 } from "lucide-react";
import type { Design, Project } from "@/lib/data";
import { showToast } from "@/components/ToastProvider";

type CollectionKind = "projects" | "designs";

export default function AdminCollection({ items, kind }: { items: Project[] | Design[]; kind: CollectionKind }) {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const isDesign = kind === "designs";
  const base = isDesign ? "/admin/3d-designs" : "/admin/projects";
  const publicBase = isDesign ? "/3d-designs" : "/projects";
  const label = isDesign ? "design" : "project";

  async function deleteItem(item: Project | Design) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(`${isDesign ? "/api/designs" : "/api/projects"}/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? `Could not delete ${label}.`);
      showToast(`${label === "design" ? "Design" : "Project"} deleted successfully.`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Could not delete ${label}.`;
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  function DeleteButton({ item }: { item: Project | Design }) {
    return (
      <button
        type="button"
        title={`Delete ${item.title}`}
        aria-label={`Delete ${item.title}`}
        disabled={deletingId === item.id}
        onClick={() => void deleteItem(item)}
        className="grid size-9 place-items-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    );
  }

  return <section className="card mt-8 overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 md:px-5">
      <div><p className="font-bold">{items.length} {items.length === 1 ? label : `${label}s`}</p><p className="mt-1 text-xs text-slate-500">Choose the layout that works best for you.</p></div>
      <div role="group" aria-label="Collection view" className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${view === "cards" ? "bg-white text-[#147ee8] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><LayoutGrid size={16}/>Cards</button>
        <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${view === "table" ? "bg-white text-[#147ee8] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><Table2 size={16}/>Table</button>
      </div>
    </div>

    {!items.length ? <div className="p-12 text-center"><p className="font-bold">No {label}s yet</p><p className="mt-1 text-sm text-slate-500">Create your first {label} to see it here.</p></div> : view === "cards" ? <div className="grid gap-5 p-5 sm:grid-cols-2 2xl:grid-cols-3">
      {items.map((item) => <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
        <Link href={`${publicBase}/${item.slug}`} className="relative block overflow-hidden bg-slate-100"><img src={item.image} alt={item.title} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">{item.status}</span></Link>
        <div className="p-4"><h2 className="truncate font-black">{item.title}</h2><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14}/>{item.location || "Location not set"}</p><p className="mt-1 text-xs text-slate-400">{isDesign ? `${(item as Design).bedrooms} bedrooms · ${(item as Design).floors} floors` : `${item.category} · ${item.area || "Area not set"}`}</p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-400">Updated content</span><div className="flex gap-1"><Link title={`View ${item.title}`} href={`${publicBase}/${item.slug}`} className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-[#147ee8]"><Eye size={16}/></Link><Link title={`Edit ${item.title}`} href={`${base}/${item.id}/edit`} className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-[#147ee8]"><Pencil size={16}/></Link><DeleteButton item={item}/></div></div>
        </div>
      </article>)}
    </div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f4f7fb] text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">{label}</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Details</th><th className="px-5 py-4">Actions</th></tr></thead><tbody>
      {items.map((item) => <tr key={item.id} className="border-t transition-colors hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={item.image} alt="" className="size-12 rounded-lg object-cover"/><span className="font-bold">{item.title}</span></div></td><td className="px-5 py-4 text-slate-500">{item.location || "—"}</td><td className="px-5 py-4"><span className="badge">{item.status}</span></td><td className="px-5 py-4 text-slate-500">{isDesign ? `${(item as Design).bedrooms} bedrooms · ${(item as Design).floors} floors` : `${item.category} · ${item.area || "—"}`}</td><td className="px-5 py-4"><div className="flex gap-1"><Link title={`View ${item.title}`} href={`${publicBase}/${item.slug}`} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-[#147ee8]"><Eye size={16}/></Link><Link title={`Edit ${item.title}`} href={`${base}/${item.id}/edit`} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-[#147ee8]"><Pencil size={16}/></Link><DeleteButton item={item}/></div></td></tr>)}
    </tbody></table><div className="flex justify-end border-t border-slate-100 p-3"><span className="inline-flex items-center gap-1 text-xs text-slate-400">{isDesign ? "Design library" : "Project portfolio"}<ArrowUpRight size={13}/></span></div></div>}
  </section>;
}
