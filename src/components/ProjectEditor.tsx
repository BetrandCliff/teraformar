"use client";
import { FormEvent, useState } from "react";
import type { DesignFloor, DesignRoom, Project } from "@/lib/data";
import { uploadMediaFiles } from "@/lib/upload-media";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ToastProvider";

const emptyRoom = (): DesignRoom => ({ name: "", type: "", area: "", notes: "" });
const makeFloor = (index: number): DesignFloor => ({ label: index === 0 ? "Ground floor" : `Floor ${index + 1}`, rooms: [emptyRoom()] });

export default function ProjectEditor({ project }: { project?: Project }) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [floorDetails, setFloorDetails] = useState<DesignFloor[]>(() => project?.floorDetails?.length
    ? project.floorDetails
    : Array.from({ length: Math.min(Math.max(project?.floors ?? 1, 1), 30) }, (_, index) => makeFloor(index)));
  const router = useRouter();
  function setFloorCount(count: number) {
    setFloorDetails((current) => Array.from({ length: count }, (_, index) => current[index] ?? makeFloor(index)));
  }
  function updateFloor(floorIndex: number, patch: Partial<DesignFloor>) {
    setFloorDetails((current) => current.map((floor, index) => index === floorIndex ? { ...floor, ...patch } : floor));
  }
  function updateRoom(floorIndex: number, roomIndex: number, patch: Partial<DesignRoom>) {
    setFloorDetails((current) => current.map((floor, index) => index === floorIndex
      ? { ...floor, rooms: floor.rooms.map((room, index) => index === roomIndex ? { ...room, ...patch } : room) }
      : floor));
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const raw = Object.fromEntries([...formData.entries()].filter(([key]) => !key.endsWith("_files")));
    try {
      setSaving(true);
      const mainFiles = (form.elements.namedItem("main_image_files") as HTMLInputElement).files;
      const galleryFiles = (form.elements.namedItem("gallery_files") as HTMLInputElement).files;
      let image = project?.image ?? "";
      if (mainFiles?.length) { setStatus("Uploading main project image…"); image = (await uploadMediaFiles(mainFiles, "projects"))[0]; }
      if (!image) throw new Error("Choose a main project image.");
      let gallery = project?.gallery ?? [];
      if (galleryFiles?.length) { setStatus("Uploading gallery images…"); gallery = [...gallery, ...await uploadMediaFiles(galleryFiles, "projects")]; }
      const uploadList = async (field: string, current: string[] = []) => { const files = (form.elements.namedItem(field) as HTMLInputElement).files; return files?.length ? [...current, ...await uploadMediaFiles(files, "projects")] : current; };
      setStatus("Uploading project plans and documents…");
      const floorPlans = await uploadList("floor_plan_files", project?.floorPlans);
      const architecturalDrawings = await uploadList("architectural_files", project?.architecturalDrawings);
      const structuralDrawings = await uploadList("structural_files", project?.structuralDrawings);
      const documents = await uploadList("document_files", project?.documents);
      const title = String(raw.title ?? "");
      const cleanedFloors = floorDetails.map((floor) => ({
        label: floor.label?.trim() ?? "",
        rooms: floor.rooms.map((room) => ({ name: room.name?.trim() ?? "", type: room.type?.trim() ?? "", area: room.area?.trim() ?? "", notes: room.notes?.trim() ?? "" })),
      }));
      const data = { ...project, ...raw, title, image, gallery, slug: project?.slug ?? title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), bedrooms: Number(raw.bedrooms || 0), bathrooms: Number(raw.bathrooms || 0), floors: cleanedFloors.length, floorDetails: cleanedFloors, floorPlans, architecturalDrawings, structuralDrawings, documents };
      setStatus("Saving project…");
      const response = await fetch(project ? `/api/projects/${project.id}` : "/api/projects", { method: project ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save project");
      showToast("Project saved successfully.");
      router.push("/admin/projects");
    } catch (error) { const message=error instanceof Error ? error.message : "Could not save project.";setStatus(message);showToast(message,"error"); }
    finally { setSaving(false); }
  }

  const fields: [string, string, string][] = [["title", "Project name", project?.title ?? ""], ["location", "Location", project?.location ?? ""], ["category", "Category", project?.category ?? "Residential"], ["status", "Status", project?.status ?? "Published"], ["duration", "Construction duration", project?.duration ?? ""], ["area", "Building area", project?.area ?? ""], ["landSize", "Land size", project?.landSize ?? ""], ["bedrooms", "Bedrooms", String(project?.bedrooms ?? 0)], ["bathrooms", "Bathrooms / toilets", String(project?.bathrooms ?? 0)]];
  return <form onSubmit={save} className="admin-editor mt-8 grid max-w-5xl gap-5">
    <section className="card p-6 md:p-7"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">01 · Overview</p><h2 className="mt-1 text-lg font-black">Project information</h2><p className="mt-1 text-sm text-slate-500">Add the essentials that identify and describe this project.</p></div><div className="grid gap-5 md:grid-cols-2">
      {fields.map(([name,label,value]) => <label className="grid gap-2 text-sm font-semibold text-slate-700" key={name}>{label}{name === "category" ? <select name={name} defaultValue={value} className="input"><option>Residential</option><option>Commercial</option></select> : name === "status" ? <select name={name} defaultValue={value} className="input"><option>Published</option><option>In Progress</option><option>Completed</option></select> : <input required={name === "title"} name={name} type={["bedrooms","bathrooms","floors"].includes(name) ? "number" : "text"} defaultValue={value} className="input"/>}</label>)}
    </div></section>
    <section className="card p-6 md:p-7"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">02 · Floor plan</p><h2 className="mt-1 text-lg font-black">Floors and rooms</h2><p className="mt-1 text-sm text-slate-500">Set the number of floors, then add room details for each one.</p></div>
      <label className="grid max-w-xs gap-2 text-sm font-semibold text-slate-700">Number of floors<input type="number" min="1" max="30" value={floorDetails.length} onChange={(event) => setFloorCount(Math.min(30, Math.max(1, Number(event.target.value) || 1)))} className="input"/></label>
      <div className="mt-5 grid gap-5">{floorDetails.map((floor, floorIndex) => <div key={floorIndex} className="rounded-2xl border border-slate-200 p-4 md:p-5">
        <div className="flex flex-wrap items-end gap-3"><label className="grid min-w-52 flex-1 gap-2 text-sm font-semibold text-slate-700">Floor name or level<input value={floor.label ?? ""} onChange={(event) => updateFloor(floorIndex, { label: event.target.value })} className="input" placeholder={`Floor ${floorIndex + 1}`}/></label><button type="button" className="btn btn-outline" onClick={() => updateFloor(floorIndex, { rooms: [...floor.rooms, emptyRoom()] })}>Add room</button></div>
        <div className="mt-4 grid gap-3">{floor.rooms.map((room, roomIndex) => <div key={roomIndex} className="grid gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Room name<input value={room.name ?? ""} onChange={(event) => updateRoom(floorIndex, roomIndex, { name: event.target.value })} className="input bg-white" placeholder="e.g. Main bedroom"/></label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Room type<input value={room.type ?? ""} onChange={(event) => updateRoom(floorIndex, roomIndex, { type: event.target.value })} className="input bg-white" placeholder="e.g. Bedroom, kitchen, office"/></label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Area<input value={room.area ?? ""} onChange={(event) => updateRoom(floorIndex, roomIndex, { area: event.target.value })} className="input bg-white" placeholder="Optional, e.g. 18 m²"/></label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Notes<input value={room.notes ?? ""} onChange={(event) => updateRoom(floorIndex, roomIndex, { notes: event.target.value })} className="input bg-white" placeholder="Optional room details"/></label>
          <button type="button" className="w-fit text-xs font-bold text-rose-600 hover:underline md:col-span-2" onClick={() => updateFloor(floorIndex, { rooms: floor.rooms.filter((_, index) => index !== roomIndex) })}>Remove room</button>
        </div>)}</div>
      </div>)}</div>
    </section>
    <section className="card p-6 md:p-7"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">02 · Media</p><h2 className="mt-1 text-lg font-black">Project imagery</h2><p className="mt-1 text-sm text-slate-500">Upload image files from your device. Existing media is retained when no new file is selected.</p></div><div className="grid gap-5 md:grid-cols-2">
      <label className="grid content-start gap-2 text-sm font-semibold text-slate-700">Main project image <input required={!project?.image} name="main_image_files" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="input"/>{project?.image&&<img src={project.image} alt="Current project cover" className="mt-2 aspect-video w-full rounded-xl object-cover"/>}</label>
      <label className="grid content-start gap-2 text-sm font-semibold text-slate-700">Gallery images <input name="gallery_files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="input"/>{!!project?.gallery.length&&<span className="text-xs font-normal text-slate-500">{project.gallery.length} existing gallery image(s); new uploads are added to the gallery.</span>}</label>
    </div></section>
    <section className="card p-6 md:p-7"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">03 · Files</p><h2 className="mt-1 text-lg font-black">Plans and documents</h2><p className="mt-1 text-sm text-slate-500">Add plans, drawings and supporting files for this project.</p></div><div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">Floor plans<input name="floor_plan_files" type="file" multiple accept="image/*,application/pdf" className="input"/>{!!project?.floorPlans.length&&<span className="text-xs font-normal text-slate-500">{project.floorPlans.length} existing file(s)</span>}</label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">Architectural drawings<input name="architectural_files" type="file" multiple accept="image/*,application/pdf" className="input"/>{!!project?.architecturalDrawings.length&&<span className="text-xs font-normal text-slate-500">{project.architecturalDrawings.length} existing file(s)</span>}</label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">Structural drawings<input name="structural_files" type="file" multiple accept="image/*,application/pdf" className="input"/>{!!project?.structuralDrawings.length&&<span className="text-xs font-normal text-slate-500">{project.structuralDrawings.length} existing file(s)</span>}</label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">Other project documents<input name="document_files" type="file" multiple accept="image/*,application/pdf" className="input"/>{!!project?.documents.length&&<span className="text-xs font-normal text-slate-500">{project.documents.length} existing file(s)</span>}</label>
    </div></section>
    <section className="card p-6 md:p-7"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">04 · Description</p><h2 className="mt-1 text-lg font-black">Project story</h2><label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">Description<textarea name="description" defaultValue={project?.description ?? ""} className="input min-h-32" placeholder="Describe the design, scope and notable details…"/></label></section>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><p role="status" className="text-sm text-slate-500">{status || "Your changes are saved to the project database."}</p><button disabled={saving} className="btn btn-primary min-w-36 disabled:opacity-60">{saving ? "Saving project…" : project ? "Save changes" : "Create project"}</button></div>
  </form>;
}
