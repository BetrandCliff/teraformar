"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FolderKanban, Box, CalendarDays, Users, Settings, LogOut,
  PanelLeftClose, PanelLeftOpen, Moon, Sun, Building2, ArrowUpRight,
} from "lucide-react";
import { useAppTheme } from "@/components/ThemeProvider";

const links = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Projects", "/admin/projects", FolderKanban],
  ["3D Designs", "/admin/3d-designs", Box],
  ["Appointments", "/admin/appointments", CalendarDays],
  ["Messages", "/admin/messages", Users],
  ["Documents", "/admin/documents", FolderKanban],
  ["Settings", "/admin/settings", Settings],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentTheme, setTheme } = useAppTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [companyName, setCompanyName] = useState("BuildVision");

  useEffect(() => {
    let mounted = true;
    const updateCompanyName = (name: unknown) => {
      if (mounted && typeof name === "string" && name.trim()) setCompanyName(name.trim());
    };
    const handleSettingsUpdated = (event: Event) => {
      updateCompanyName((event as CustomEvent<{ companyName?: unknown }>).detail?.companyName);
    };

    window.addEventListener("site-settings-updated", handleSettingsUpdated);
    fetch("/api/settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const settings = await response.json() as { companyName?: unknown };
        updateCompanyName(settings.companyName);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      window.removeEventListener("site-settings-updated", handleSettingsUpdated);
    };
  }, []);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("admin-sidebar-collapsed") === "true");
    setSidebarReady(true);
  }, []);
  useEffect(() => {
    if (sidebarReady) window.localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed, sidebarReady]);

  if (pathname === "/admin/login" || pathname === "/admin/forgot-password") return <>{children}</>;

  return <div className="min-h-screen bg-[#f4f7fb]">
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className={`${collapsed ? "w-[76px]" : "w-[248px]"} sticky top-0 z-40 hidden h-screen shrink-0 self-start flex-col overflow-y-auto bg-gradient-to-b from-[#071729] via-[#0b2036] to-[#081a2c] px-3 py-4 text-white shadow-xl shadow-slate-950/10 transition-[width] duration-300 ease-in-out sm:px-4 md:flex`}>
        <div className={`mb-7 flex min-h-12 items-center border-b border-white/10 pb-4 ${collapsed ? "justify-center" : "justify-between gap-2"}`}>
          <Link href="/admin" aria-label={`${companyName} admin dashboard`} title={collapsed ? `${companyName} Admin` : undefined} className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#55a9ff] to-[#147ee8] text-white shadow-lg shadow-blue-950/40"><Building2 size={20}/></span>
            {!collapsed && <span className="min-w-0"><span className="block truncate text-sm font-black tracking-wide">{companyName}</span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Admin workspace</span></span>}
          </Link>
          {!collapsed && <button type="button" aria-label="Minimize sidebar" title="Minimize sidebar" onClick={() => setCollapsed(true)} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"><PanelLeftClose size={17}/></button>}
        </div>
        {collapsed && <button type="button" aria-label="Expand sidebar" title="Expand sidebar" onClick={() => setCollapsed(false)} className="mb-5 grid size-10 self-center place-items-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"><PanelLeftOpen size={18}/></button>}

        {!collapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Workspace</p>}
        <nav aria-label="Admin navigation" className="grid gap-1.5">
          {links.map(([title, href, Icon]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link href={href} key={href} title={collapsed ? title : undefined} aria-label={title} aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-11 items-center ${collapsed ? "justify-center px-0" : "gap-3 px-3"} rounded-xl text-[13px] font-semibold transition-all duration-200 ${active ? "bg-gradient-to-r from-[#147ee8]/25 to-[#147ee8]/10 text-white shadow-inner shadow-white/5" : "text-slate-400 hover:bg-white/[.07] hover:text-white"}`}>
              {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#55a9ff] shadow-[0_0_12px_rgba(85,169,255,.8)]"/>}
              <Icon size={18} className={`shrink-0 transition-transform duration-200 ${active ? "text-[#72baff]" : "group-hover:scale-105 group-hover:text-slate-200"}`}/>
              {!collapsed && <span className="truncate">{title}</span>}
              {!collapsed && active && <span className="ml-auto size-1.5 rounded-full bg-[#55a9ff]"/>}
            </Link>;
          })}
        </nav>

        <div className="mt-auto pt-6">
          {!collapsed && <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.04] px-3 py-2.5"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40"/><span className="relative inline-flex size-2 rounded-full bg-emerald-400"/></span><span className="text-[11px] font-medium text-slate-300">Workspace active</span></div>}
          <div className="border-t border-white/10 pt-3">
            <Link href="/" title={collapsed ? "Back to website" : undefined} aria-label="Back to website" className={`group flex min-h-10 items-center ${collapsed ? "justify-center px-0" : "gap-3 px-3"} rounded-xl text-xs font-semibold text-slate-400 transition hover:bg-white/[.07] hover:text-white`}>
              <LogOut size={17} className="shrink-0"/>{!collapsed && <><span>Back to website</span><ArrowUpRight size={14} className="ml-auto opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"/></>}
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-16 flex-col justify-center gap-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-xl sm:px-5 md:h-16 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex w-full items-center justify-between gap-3"><div className="min-w-0"><p className="hidden text-xs font-medium text-slate-400 sm:block">{companyName} / Admin</p><span className="text-sm font-bold text-slate-700">{links.find(([, href]) => href === "/admin" ? pathname === href : pathname.startsWith(href))?.[0] ?? "Administration"}</span></div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setTheme("admin", currentTheme === "dark" ? "light" : "dark")} aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} admin theme`} title="Toggle admin theme" className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#147ee8]">{currentTheme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <span className="hidden h-7 w-px bg-slate-200 sm:block"/>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/admin/login"); }} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600 sm:px-3 sm:text-sm">Sign out</button>
          </div></div>
          <nav aria-label="Admin navigation" className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-0.5 md:hidden">
            {links.map(([title, href, Icon]) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return <Link href={href} key={href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${active ? "bg-blue-50 text-[#147ee8]" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={15}/>{title}</Link>;
            })}
          </nav>
        </header>
        <main className="min-w-0 p-3 sm:p-5 md:p-8 xl:p-9">{children}</main>
      </div>
    </div>
  </div>;
}
