import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ProjectEditor from "@/components/ProjectEditor";
import { getProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await getProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return notFound();
  return <div className="admin-content"><Link className="inline-flex items-center gap-2 text-sm font-bold text-[#147ee8] transition hover:gap-3" href="/admin/projects"><ArrowLeft size={16}/>Projects</Link><p className="mt-5 text-sm font-semibold text-[#147ee8]">Project portfolio</p><h1 className="mt-1 text-3xl font-black tracking-tight">Edit project</h1><p className="mt-2 text-sm text-slate-500">Update information and manage files for <span className="font-semibold">{project.title}</span>.</p><ProjectEditor project={project}/></div>;
}
