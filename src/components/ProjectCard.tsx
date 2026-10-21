import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Project } from "@/lib/data";
import ImageLightbox from "@/components/ImageLightbox";

export default function ProjectCard({ project }: { project: Project }) {
  return <article className="public-project-card card group">
    <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e5dc]"><ImageLightbox src={project.image} alt={project.title} className="h-full w-full" imageClassName="h-full w-full object-cover transition duration-700 group-hover/image:scale-[1.04]"/><span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#34463c] backdrop-blur">{project.category}</span><Link href={`/projects/${project.slug}`} aria-label={`View ${project.title}`} className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full bg-[#a96645] text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={18}/></Link></div>
    <div className="p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="truncate text-lg font-bold tracking-tight">{project.title}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13}/>{project.location}</p></div><span className="mt-1 size-2 shrink-0 rounded-full bg-[#b87751]"/></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-400">{project.area || "Designed for living"}</span><Link href={`/projects/${project.slug}`} className="public-card-link inline-flex items-center gap-1.5 text-xs font-bold">View project<ArrowUpRight size={14}/></Link></div></div>
  </article>;
}
