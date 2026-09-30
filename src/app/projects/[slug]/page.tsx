import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, Rotate3D, ZoomIn } from "lucide-react";
import { getProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";

export default async function ProjectDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return notFound();
  const facts = [["Location", project.location], ["Category", project.category], ["Status", project.status], ["Duration", project.duration], ["Bedrooms", String(project.bedrooms)], ["Bathrooms / toilets", String(project.bathrooms)], ["Floors", String(project.floors)], ["Building area", project.area], ["Land size", project.landSize ?? "Not specified"]];
  const fileGroups: [string, string[]][] = [["Floor plans", project.floorPlans], ["Architectural drawings", project.architecturalDrawings], ["Structural drawings", project.structuralDrawings], ["Project documents", project.documents]];

  return <div>
    <div className="container py-7"><Link href="/projects" className="flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/>Back to Projects</Link></div>
    <div className="container overflow-hidden rounded-3xl"><img src={project.image} alt={project.title} className="h-[360px] w-full object-cover md:h-[540px]"/></div>
    <section className="section pt-12"><div className="container">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr]"><div><div className="eyebrow">{project.category}</div><h1 className="mt-2 text-4xl font-black">{project.title}</h1><p className="mt-5 leading-8 text-slate-600">{project.description}</p><div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">{facts.map(([label,value])=><div className="rounded-xl bg-[#f4f7fb] p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>)}</div></div>
      <div className="rounded-2xl bg-[#f4f7fb] p-5"><div className="mb-4 flex items-center justify-between"><div><p className="font-black">3D concept preview</p><p className="text-xs text-slate-500">A visual reference for the project</p></div><div className="flex gap-2 text-slate-500"><Rotate3D size={17}/><ZoomIn size={17}/><Maximize2 size={17}/></div></div><div className="overflow-hidden rounded-xl"><img src={project.image} alt={`${project.title} concept preview`} className="aspect-video w-full object-cover"/></div><Link href="/booking" className="btn btn-primary mt-4 w-full">Book a Consultation</Link></div></div>
      {!!project.gallery.length&&<section className="mt-14"><h2 className="text-2xl font-black">Project gallery</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{project.gallery.map((image,index)=><img key={`${image}-${index}`} src={image} alt={`${project.title} gallery ${index+1}`} className="aspect-[4/3] w-full rounded-2xl object-cover"/>)}</div></section>}
      {!!fileGroups.some(([,files])=>files.length)&&<section className="mt-14 grid gap-6 md:grid-cols-2">{fileGroups.filter(([,files])=>files.length).map(([title,files])=><div className="card p-5" key={title}><h2 className="font-black">{title}</h2><div className="mt-3 grid gap-2">{files.map((file,index)=><a key={`${file}-${index}`} href={file} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#147ee8]">Open {title} {index+1} →</a>)}</div></div>)}</section>}
    </div></section>
  </div>;
}
