import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, Rotate3D, ZoomIn, Move3D } from "lucide-react";
import { getDesigns } from "@/lib/projects";
export const dynamic = "force-dynamic";
export default async function DesignDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getDesigns();
  const p = projects.find((x) => x.slug === slug);
  if (!p) return notFound();
  return (
    <>
      <div className="container py-7">
        <Link
          href="/3d-designs"
          className="flex items-center gap-2 text-sm font-bold text-slate-500"
        >
          <ArrowLeft size={16} />
          Back to 3D Designs
        </Link>
      </div>
      <section className="pb-20">
        <div className="container grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
          <div className="overflow-hidden rounded-3xl bg-slate-950 p-4">
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              <img
                src={p.image}
                className="h-full w-full object-cover opacity-80"
                alt={p.title}
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-full bg-white/15 p-5 backdrop-blur">
                  <Rotate3D size={34} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white">
                <span className="flex gap-4">
                  <Move3D />
                  <ZoomIn />
                  <Maximize2 />
                </span>
                <span className="rounded bg-black/50 px-3 py-1 text-xs">
                  Interactive Preview
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="eyebrow">{p.category}</div>
            <h1 className="mt-2 text-4xl font-black">{p.title} Concept</h1>
            <p className="mt-5 leading-7 text-slate-600">
              {p.description} This 3D concept is intended to help clients
              understand massing, proportions, materials and spatial character
              before construction.
            </p>
            {p.modelUrl && <a href={p.modelUrl} target="_blank" rel="noreferrer" className="btn btn-outline mt-5 w-full">Open / download the 3D model</a>}
            {p.videoUrl && <a href={p.videoUrl} target="_blank" rel="noreferrer" className="btn btn-primary mt-3 w-full">Watch design video ↗</a>}
            {!!p.interiorImages?.length && <section className="mt-8"><h2 className="text-xl font-black">Design gallery</h2><div className="mt-4 grid grid-cols-2 gap-3">{p.interiorImages.map((image,index)=><img key={`${image}-${index}`} src={image} alt={`${p.title} gallery view ${index+1}`} className="aspect-square w-full rounded-xl object-cover"/>)}</div></section>}
            {!!p.floorDetails?.length && <section className="mt-8"><h2 className="text-xl font-black">Floors, apartments and spaces</h2><div className="mt-4 grid gap-3">{p.floorDetails.map((floor, floorIndex)=><article key={`${floor.label}-${floorIndex}`} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-bold">{floor.label || `Floor ${floorIndex + 1}`}</h3>{floor.area && <span className="text-sm text-slate-500">{floor.area}</span>}</div>{floor.description&&<p className="mt-2 text-sm leading-6 text-slate-600">{floor.description}</p>}{floor.apartments?.length ? <div className="mt-3 grid gap-3">{floor.apartments.map((apartment,apartmentIndex)=><div key={apartmentIndex} className="rounded-lg bg-slate-50 p-3"><h4 className="font-semibold">{apartment.label || `Apartment ${apartmentIndex+1}`}</h4>{apartment.rooms.length ? <ul className="mt-2 grid gap-2">{apartment.rooms.map((space,spaceIndex)=><li key={`${space.name}-${spaceIndex}`} className="rounded-lg bg-white p-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-semibold">{space.name || space.type || `Space ${spaceIndex+1}`}</span>{space.area&&<span className="text-xs text-slate-500">{space.area}</span>}</div>{space.name&&space.type&&<p className="mt-1 text-xs text-slate-500">{space.type}</p>}{space.notes&&<p className="mt-2 text-sm text-slate-600">{space.notes}</p>}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No spaces added.</p>}</div>)}</div> : floor.rooms.length>0 ? <p className="mt-3 text-sm text-slate-500">Legacy spaces: {floor.rooms.map((space)=>space.name||space.type).filter(Boolean).join(", ")}</p> : <p className="mt-3 text-sm text-slate-500">No apartments added.</p>}</article>)}</div></section>}
            <div className="mt-7 rounded-2xl bg-[#f4f7fb] p-5">
              <p className="font-black">Interested in this design?</p>
              <p className="mt-2 text-sm text-slate-500">
                Book a consultation to discuss adapting the concept to your site
                and requirements.
              </p>
              <Link href="/booking" className="btn btn-primary mt-5 w-full">
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
