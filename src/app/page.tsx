import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Users } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import SectionTitle from "@/components/SectionTitle";
import { getProjects } from "@/lib/projects";
import { getSiteSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";

const values = [
  { Icon: ShieldCheck, title: "Craft with care", text: "Careful planning and considered execution at every stage." },
  { Icon: Clock3, title: "Clear delivery", text: "Defined milestones and communication you can count on." },
  { Icon: Users, title: "One capable team", text: "Design and construction specialists working together." },
  { Icon: CheckCircle2, title: "Built to last", text: "Practical, timeless spaces made for everyday life." },
];

export default async function Home() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()]);
  return <>
    <section className="public-hero relative isolate min-h-[650px] overflow-hidden text-white lg:min-h-[700px]">
      <img src={settings.homeHeroImage || "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2000&q=85"} className="absolute inset-0 -z-20 h-full w-full object-cover" alt="Contemporary residence designed with generous natural light"/>
      <div className="public-hero-shade absolute inset-0 -z-10"/>
      <div className="container grid min-h-[650px] items-center gap-12 py-16 lg:min-h-[700px] lg:grid-cols-[minmax(0,1fr)_300px] lg:py-20">
        <div className="max-w-3xl">
          <div className="public-hero-kicker inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.17em]">Construction <span className="size-1 rounded-full bg-[#e6b58e]"/> Architecture <span className="size-1 rounded-full bg-[#e6b58e]"/> 3D design</div>
          <h1 className="public-display mt-7 max-w-3xl text-5xl leading-[1.03] md:text-7xl lg:text-[5.3rem]">Spaces shaped around <span className="text-[#e6b58e]">your vision.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/75 md:text-lg">From the first sketch to the final finish, we make thoughtful architecture and dependable construction feel clear at every step.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/projects" className="public-cta inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition">Explore our work<ArrowRight size={17}/></Link><Link href="/booking" className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">Plan a consultation</Link></div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-white/70"><span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#e6b58e]"/>Clear project planning</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#e6b58e]"/>Architecture through delivery</span></div>
        </div>
        <aside className="public-hero-aside hidden rounded-2xl p-5 text-white lg:block"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e6b58e]">Our approach</p><div className="public-hero-aside-item py-5"><p className="text-2xl font-semibold">Thoughtful</p><p className="mt-1 text-xs leading-5 text-white/65">Designs made around how you want to live and work.</p></div><div className="public-hero-aside-item py-5"><p className="text-2xl font-semibold">Coordinated</p><p className="mt-1 text-xs leading-5 text-white/65">Architecture and construction planned as one process.</p></div><div className="public-hero-aside-item py-5 pb-1"><p className="text-2xl font-semibold">Transparent</p><p className="mt-1 text-xs leading-5 text-white/65">Straightforward communication from the first meeting.</p></div></aside>
      </div>
    </section>

    <section className="section"><div className="container"><div className="mb-10 flex flex-wrap items-end justify-between gap-5"><SectionTitle eyebrow="Selected work" title="Projects with purpose." text="A selection of residential and commercial work, shaped around place, people and lasting value."/><Link href="/projects" className="public-card-link hidden items-center gap-2 pb-2 text-sm font-bold transition md:inline-flex">Explore all projects<ArrowRight size={16}/></Link></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{projects.slice(0, 3).map((project) => <ProjectCard key={project.slug} project={project}/>)}</div></div></section>

    <section className="public-alt-section py-20"><div className="container"><SectionTitle eyebrow="The BuildVision difference" title="Good work starts with a better process." text="A trusted team, an informed plan and thoughtful design make the journey as considered as the finished space." center/><div className="mt-11 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{values.map(({ Icon, title, text }, index) => <article className="public-value-card rounded-2xl border bg-white p-6" key={title}><span className="grid size-11 place-items-center rounded-xl bg-[#f2ece3] text-[#a96645]"><Icon size={20}/></span><p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#b87751]">0{index + 1}</p><h3 className="mt-2 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></div></section>

    <section className="section"><div className="public-cta-panel container relative overflow-hidden rounded-[28px] bg-[#172b26] px-7 py-12 text-white md:px-14 md:py-16"><div className="absolute -right-20 -top-32 size-96 rounded-full border border-white/10"/><div className="absolute -right-2 -top-14 size-64 rounded-full border border-white/10"/><div className="relative max-w-2xl"><div className="eyebrow text-[#e6b58e]">Your next chapter</div><h2 className="public-display mt-4 text-4xl leading-tight md:text-5xl">Let’s make room for what matters.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/65">Tell us what you have in mind. We’ll help you find a thoughtful way to bring it to life.</p><Link href="/booking" className="public-cta mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition">Talk with our team<ArrowRight size={16}/></Link></div></div></section>
  </>;
}
