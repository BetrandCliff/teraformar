import Link from "next/link";
import { BedDouble, Maximize, Toilet, Users } from "lucide-react";
import type { Design } from "@/lib/data";
import ImageLightbox from "@/components/ImageLightbox";

export default function DesignCard({ d }: { d: Design }) {
  const apartments = (d.floorDetails ?? []).reduce(
    (count, floor) => count + (floor.apartments?.length ?? (floor.rooms.length ? 1 : 0)),
    0,
  );
  const rooms = (d.floorDetails ?? []).reduce(
    (count, floor) => count + (floor.apartments?.length
      ? floor.apartments.reduce((apartmentCount, apartment) => apartmentCount + apartment.rooms.length, 0)
      : floor.rooms.length),
    0,
  );
  const floors = d.floorDetails?.length ?? d.floors;

  return <article className="public-project-card card group">
    <div className="relative h-60 overflow-hidden bg-[#e9e5dc]"><ImageLightbox src={d.image} alt={d.title} className="h-full w-full" imageClassName="h-full w-full object-cover transition duration-700 group-hover/image:scale-[1.04]"/><span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#34463c]">{d.category} concept</span></div>
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a96645]">{d.status}</span><span className="text-xs text-slate-500">{d.location}</span></div>
      <h3 className="mt-2 text-xl font-bold tracking-tight">{d.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{d.area || "Architectural visualization"}</p>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-2.5"><Users size={15} className="mb-1 text-[#a96645]"/><b>{apartments}</b> apartments</div>
        <div className="rounded-lg bg-gray-50 p-2.5"><BedDouble size={15} className="mb-1 text-[#a96645]"/><b>{rooms}</b> rooms</div>
        <div className="rounded-lg bg-gray-50 p-2.5"><Toilet size={15} className="mb-1 text-[#a96645]"/><b>{floors}</b> floors</div>
        <div className="rounded-lg bg-gray-50 p-2.5"><Maximize size={15} className="mb-1 text-[#a96645]"/><b>{d.area || "—"}</b> area</div>
      </div>
      <Link href={`/3d-designs/${d.slug}`} className="public-cta mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition">Explore design</Link>
    </div>
  </article>;
}
