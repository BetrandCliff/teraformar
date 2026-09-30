import Link from "next/link";
import { Plus } from "lucide-react";
import { getProjects } from "@/lib/projects";
import AdminCollection from "@/components/AdminCollection";
export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  const projects = await getProjects();
  return <div className="admin-content">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#147ee8]">Content management</p><h1 className="mt-1 text-3xl font-black tracking-tight">Projects</h1><p className="mt-2 text-sm text-slate-500">Manage project details, imagery, plans and published status.</p></div><Link href="/admin/projects/new" className="btn btn-primary"><Plus size={17}/>Add project</Link></div>
    <AdminCollection items={projects} kind="projects"/>
  </div>;
}
