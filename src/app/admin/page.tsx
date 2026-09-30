import { ArrowUpRight, Box, CalendarDays, CheckCircle2, FolderKanban, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { getDesigns, getProjects } from "@/lib/projects";
import { typeormRequest } from "@/lib/typeorm";
import { services } from "@/lib/data";
export const dynamic = "force-dynamic";

type Appointment = { id: string; name: string; service_id: string | null; appointment_date: string; status: string };

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-blue-50 text-blue-700",
};

export default async function Admin() {
  const [projects, designs, appointments] = await Promise.all([
    getProjects(),
    getDesigns(),
    typeormRequest<Appointment[]>("appointments", { query: "?select=id,name,service_id,appointment_date,status&order=created_at.desc&limit=5" }).catch(() => []),
  ]);
  const stats = [
    { title: "Projects", count: projects.length, href: "/admin/projects", Icon: FolderKanban, note: "Project portfolio" },
    { title: "3D Designs", count: designs.length, href: "/admin/3d-designs", Icon: Box, note: "Design catalogue" },
    { title: "Appointments", count: appointments.length, href: "/admin/appointments", Icon: CalendarDays, note: "Recent requests" },
    { title: "Services", count: services.length, href: "/admin/settings", Icon: CheckCircle2, note: "Available offerings" },
  ];

  return <div className="admin-content space-y-8">
    <section className="relative isolate overflow-hidden rounded-2xl bg-[#081a2c] p-6 text-white shadow-xl shadow-slate-900/10 md:p-8">
      <div className="absolute -right-16 -top-28 -z-10 size-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100"><Sparkles size={14}/>Workspace overview</div><p className="mt-4 text-sm text-slate-300">Welcome back, Admin</p><h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">Dashboard</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Keep your projects, designs and client appointments organized in one place.</p></div>
        <Link href="/admin/projects/new" className="btn bg-white text-[#081a2c] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"><Plus size={17}/>Add project</Link>
      </div>
    </section>

    <section aria-label="Workspace totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ title, count, href, Icon, note }) => <Link key={title} href={href} className="card group dashboard-stat p-5">
        <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-[#147ee8]"><Icon size={20}/></span><ArrowUpRight size={17} className="text-slate-400 transition group-hover:text-[#147ee8]"/></div>
        <p className="mt-5 text-sm font-semibold text-slate-500">{title}</p><p className="mt-1 text-3xl font-black tracking-tight">{count}</p><p className="mt-2 text-xs text-slate-400">{note}</p>
      </Link>)}
    </section>

    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 md:p-6">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">Client activity</p><h2 className="mt-1 text-lg font-black">Recent appointments</h2><p className="mt-1 text-sm text-slate-500">Latest requests submitted through the website.</p></div>
        <Link href="/admin/appointments" className="inline-flex items-center gap-1 text-sm font-bold text-[#147ee8] transition hover:gap-2">View appointments <ArrowUpRight size={16}/></Link>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f4f7fb] text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4 font-bold">Client</th><th className="px-5 py-4 font-bold">Service</th><th className="px-5 py-4 font-bold">Date</th><th className="px-5 py-4 font-bold">Status</th></tr></thead>
        <tbody>{appointments.map((row) => <tr className="border-t transition-colors hover:bg-slate-50" key={row.id}><td className="px-5 py-4 font-semibold">{row.name}</td><td className="px-5 py-4 text-slate-500">{row.service_id ?? "—"}</td><td className="px-5 py-4 text-slate-500">{row.appointment_date}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[row.status.toLowerCase()] ?? "bg-slate-100 text-slate-600"}`}>{row.status}</span></td></tr>)}
          {!appointments.length && <tr><td className="px-5 py-12 text-center text-slate-500" colSpan={4}>No appointments yet.</td></tr>}
        </tbody>
      </table></div>
    </section>
  </div>;
}
