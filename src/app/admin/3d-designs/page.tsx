import Link from "next/link";
import { Plus } from "lucide-react";
import { getDesigns } from "@/lib/projects";
import AdminCollection from "@/components/AdminCollection";
export const dynamic = "force-dynamic";

export default async function AdminDesigns() {
  const designs = await getDesigns();
  return <div className="admin-content">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#147ee8]">Model library</p><h1 className="mt-1 text-3xl font-black tracking-tight">3D Designs</h1><p className="mt-2 text-sm text-slate-500">Manage cover art, 3D models, specifications and gallery images.</p></div><Link href="/admin/3d-designs/new" className="btn btn-primary"><Plus size={17}/>Upload design</Link></div>
    <AdminCollection items={designs} kind="designs"/>
  </div>;
}
