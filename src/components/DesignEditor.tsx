"use client";
import { FormEvent, useState } from "react";
import type { Design, DesignApartment, DesignFloor, DesignRoom } from "@/lib/data";
import { uploadMediaFiles } from "@/lib/upload-media";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ToastProvider";

const emptyRoom = (): DesignRoom => ({ name: "", type: "", area: "", notes: "" });
const emptyApartment = (index: number): DesignApartment => ({ label: `Apartment ${index + 1}`, rooms: [emptyRoom()] });
const emptyFloor = (index: number): DesignFloor => ({ label: index === 0 ? "Ground floor" : `Floor ${index + 1}`, area: "", description: "", rooms: [], apartments: [emptyApartment(0)] });
const normalizeFloor = (floor: DesignFloor, index: number): DesignFloor => ({
  ...emptyFloor(index), ...floor,
  apartments: floor.apartments?.length ? floor.apartments : floor.rooms.length ? [{ label: "Apartment 1", rooms: floor.rooms }] : [emptyApartment(0)],
});

export default function DesignEditor({ design }: { design?: Design }) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [floorDetails, setFloorDetails] = useState<DesignFloor[]>(() => {
    return design?.floorDetails?.map(normalizeFloor) ?? [];
  });
  const router = useRouter();

  function updateFloor(floorIndex: number, patch: Partial<DesignFloor>) {
    setFloorDetails((current) => current.map((floor, index) => index === floorIndex ? { ...floor, ...patch } : floor));
  }
  function updateApartment(floorIndex: number, apartmentIndex: number, patch: Partial<DesignApartment>) {
    setFloorDetails((current) => current.map((floor, index) => index === floorIndex ? {
      ...floor, apartments: (floor.apartments ?? []).map((apartment, index) => index === apartmentIndex ? { ...apartment, ...patch } : apartment),
    } : floor));
  }
  function updateRoom(floorIndex: number, apartmentIndex: number, roomIndex: number, patch: Partial<DesignRoom>) {
    setFloorDetails((current) => current.map((floor, index) => index === floorIndex ? {
      ...floor,
      apartments: (floor.apartments ?? []).map((apartment, apartmentIndexInner) => apartmentIndexInner === apartmentIndex
        ? { ...apartment, rooms: apartment.rooms.map((room, index) => index === roomIndex ? { ...room, ...patch } : room) }
        : apartment),
    } : floor));
  }
  function setFloorCount(count: number) {
    setFloorDetails((current) => Array.from({ length: count }, (_, index) => current[index] ?? emptyFloor(index)));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const entries = new FormData(form);
    const raw = Object.fromEntries([...entries.entries()].filter(([key]) => !key.endsWith("_file") && key !== "interior_files"));
    try {
      setSaving(true);
      let image = design?.image ?? "";
      const imageFiles = (form.elements.namedItem("cover_file") as HTMLInputElement).files;
      if (imageFiles?.length) {
        setStatus("Uploading design cover…");
        image = (await uploadMediaFiles(imageFiles, "designs"))[0];
      }
      if (!image) throw new Error("Choose a design cover image.");
      let modelUrl = design?.modelUrl ?? "";
      const modelFiles = (form.elements.namedItem("model_file") as HTMLInputElement).files;
      if (modelFiles?.length) {
        setStatus("Uploading 3D model…");
        modelUrl = (await uploadMediaFiles(modelFiles, "designs"))[0];
      }
      let interiorImages = design?.interiorImages ?? [];
      const interiorFiles = (form.elements.namedItem("interior_files") as HTMLInputElement).files;
      if (interiorFiles?.length) {
        setStatus("Uploading gallery images…");
        interiorImages = [...interiorImages, ...(await uploadMediaFiles(interiorFiles, "designs"))];
      }
      const title = String(raw.title ?? "").trim();
      const videoUrl = String(raw.videoUrl ?? "").trim();
      if (videoUrl && !/^https?:\/\//i.test(videoUrl)) throw new Error("Video link must start with http:// or https://.");
      const cleanedFloors = floorDetails.map((floor) => ({
        label: floor.label?.trim() ?? "",
        area: floor.area?.trim() ?? "",
        description: floor.description?.trim() ?? "",
        rooms: [],
        apartments: (floor.apartments ?? []).map((apartment) => ({
          label: apartment.label?.trim() ?? "",
          rooms: apartment.rooms.map((room) => ({ name: room.name?.trim() ?? "", type: room.type?.trim() ?? "", area: room.area?.trim() ?? "", notes: room.notes?.trim() ?? "" })),
        })),
      }));
      const spaces = cleanedFloors.flatMap((floor) => floor.apartments.flatMap((apartment) => apartment.rooms));
      const roomCount = (type: string) => spaces.filter((space) => space.type.toLowerCase().replace(/s$/, "") === type).length;
      const hasRoomDetails = spaces.some((space) => space.name || space.type || space.area || space.notes);
      const data = {
        ...design,
        ...raw,
        id: design?.id ?? crypto.randomUUID(),
        title,
        videoUrl,
        image,
        modelUrl,
        interiorImages,
        floorDetails: cleanedFloors,
        slug: design?.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        floors: cleanedFloors.length,
        bedrooms: hasRoomDetails ? roomCount("bedroom") : design?.bedrooms ?? 0,
        bathrooms: hasRoomDetails ? roomCount("bathroom") : design?.bathrooms ?? 0,
        parkingSpaces: design?.parkingSpaces ?? 0,
        kitchens: design?.kitchens ?? 0,
        livingRooms: design?.livingRooms ?? 0,
        diningRooms: design?.diningRooms ?? 0,
        specifications: design?.specifications ?? [],
      };
      setStatus("Saving design…");
      const response = await fetch(design ? `/api/designs/${design.id}` : "/api/designs", {
        method: design ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save design");
      showToast("Design saved successfully.");
      router.push("/admin/3d-designs");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save design";
      setStatus(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  const fields: [string, string, string][] = [
    ["title", "Design name", design?.title ?? ""],
    ["location", "Location", design?.location ?? ""],
    ["dimensions", "Building dimensions", design?.dimensions ?? ""],
    ["area", "Building area", design?.area ?? ""],
    ["landSize", "Land size", design?.landSize ?? ""],
    ["estimatedConstruction", "Estimated construction", design?.estimatedConstruction ?? ""],
  ];

  return <form onSubmit={save} className="admin-editor mt-8 grid max-w-5xl gap-5">
    <section className="card p-6 md:p-7">
      <div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">01 · Specifications</p><h2 className="mt-1 text-lg font-black">Design details</h2><p className="mt-1 text-sm text-slate-500">Add the basic details, then describe spaces floor by floor. Only the design name and cover image are required.</p></div>
      <div className="grid gap-5 md:grid-cols-2">{fields.map(([name, label, value]) => <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">{label}<input required={name === "title"} name={name} type="text" defaultValue={value} className="input"/></label>)}</div>
    </section>

    <section className="card p-6 md:p-7">
      <div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">02 · Floor plan</p><h2 className="mt-1 text-lg font-black">Floors, apartments and spaces</h2><p className="mt-1 text-sm text-slate-500">Set the floor count, describe each floor, then add its apartments and spaces.</p></div>
      <div className="flex flex-wrap items-end gap-3"><label className="grid w-full max-w-xs gap-2 text-sm font-semibold text-slate-700">Number of floors<input type="number" min="1" max="30" value={floorDetails.length} onChange={(event) => setFloorCount(Math.min(30, Math.max(1, Number(event.target.value) || 1)))} className="input"/></label><button type="button" disabled={floorDetails.length >= 30} className="btn btn-outline" onClick={() => setFloorCount(floorDetails.length + 1)}>Add floor</button></div>
      {floorDetails.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No floors added yet.</p>}
      <div className="grid gap-5">{floorDetails.map((floor, floorIndex) => <div key={floorIndex} className="rounded-2xl border border-slate-200 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"><label className="grid gap-2 text-sm font-semibold text-slate-700">Floor name or level<input value={floor.label ?? ""} onChange={(event) => updateFloor(floorIndex, { label: event.target.value })} className="input" placeholder={`Floor ${floorIndex + 1}`}/></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Floor area<input value={floor.area ?? ""} onChange={(event) => updateFloor(floorIndex, { area: event.target.value })} className="input" placeholder="e.g. 120 m²"/></label><button type="button" aria-label={`Remove floor ${floorIndex + 1}`} className="btn btn-outline" onClick={() => setFloorDetails((current) => current.filter((_, index) => index !== floorIndex))}>Remove floor</button></div>
        <label className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">Floor description<textarea value={floor.description ?? ""} onChange={(event) => updateFloor(floorIndex, { description: event.target.value })} className="input min-h-20" placeholder="Describe this floor"/></label>
        <div className="mt-4 grid gap-4">{(floor.apartments ?? []).map((apartment, apartmentIndex) => <div key={apartmentIndex} className="rounded-xl bg-slate-50 p-4">
          <div className="flex flex-wrap items-end gap-3"><label className="grid min-w-52 flex-1 gap-2 text-sm font-semibold text-slate-700">Apartment name or number<input value={apartment.label ?? ""} onChange={(event) => updateApartment(floorIndex, apartmentIndex, { label: event.target.value })} className="input bg-white" placeholder={`Apartment ${apartmentIndex + 1}`}/></label><button type="button" className="btn btn-outline" onClick={() => updateApartment(floorIndex, apartmentIndex, { rooms: [...apartment.rooms, emptyRoom()] })}>Add space</button><button type="button" className="btn btn-outline" onClick={() => updateFloor(floorIndex, { apartments: (floor.apartments ?? []).filter((_, index) => index !== apartmentIndex) })}>Remove apartment</button></div>
          <div className="mt-3 grid gap-3">{apartment.rooms.map((room, roomIndex) => <div key={roomIndex} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Space name<input value={room.name ?? ""} onChange={(event) => updateRoom(floorIndex, apartmentIndex, roomIndex, { name: event.target.value })} className="input" placeholder="e.g. Main bedroom"/></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Space type<input value={room.type ?? ""} onChange={(event) => updateRoom(floorIndex, apartmentIndex, roomIndex, { type: event.target.value })} className="input" placeholder="e.g. Bedroom, kitchen, office"/></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Area<input value={room.area ?? ""} onChange={(event) => updateRoom(floorIndex, apartmentIndex, roomIndex, { area: event.target.value })} className="input" placeholder="e.g. 18 m²"/></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Notes<input value={room.notes ?? ""} onChange={(event) => updateRoom(floorIndex, apartmentIndex, roomIndex, { notes: event.target.value })} className="input" placeholder="Optional space details"/></label>
            <button type="button" className="w-fit text-xs font-bold text-rose-600 hover:underline md:col-span-2" onClick={() => updateApartment(floorIndex, apartmentIndex, { rooms: apartment.rooms.filter((_, index) => index !== roomIndex) })}>Remove space</button>
          </div>)}</div>
        </div>)}</div>
        <button type="button" className="btn btn-outline mt-4" onClick={() => updateFloor(floorIndex, { apartments: [...(floor.apartments ?? []), emptyApartment((floor.apartments ?? []).length)] })}>Add apartment</button>
      </div>)}</div>
    </section>

    <section className="card p-6 md:p-7"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">03 · Media</p><h2 className="mt-1 text-lg font-black">Design files and imagery</h2><p className="mt-1 text-sm text-slate-500">A cover image is required. The GLB model and gallery images are optional.</p></div><div className="grid gap-5 md:grid-cols-2">
      <label className="grid content-start gap-2 text-sm font-semibold text-slate-700">Cover image<input required={!design?.image} name="cover_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="input"/>{design?.image&&<img src={design.image} alt="Current design cover" className="mt-2 aspect-video w-full rounded-xl object-cover"/>}</label>
      <label className="grid content-start gap-2 text-sm font-semibold text-slate-700">3D model file (.glb)<input name="model_file" type="file" accept=".glb,model/gltf-binary,application/octet-stream" className="input"/>{design?.modelUrl&&<a href={design.modelUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#147ee8] hover:underline">Open current model</a>}</label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">Interior/gallery images<input name="interior_files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="input"/>{!!design?.interiorImages.length&&<span className="text-xs font-normal text-slate-500">{design.interiorImages.length} existing image(s); new uploads are added to the gallery.</span>}</label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">Design video link<input name="videoUrl" type="url" defaultValue={design?.videoUrl ?? ""} className="input" placeholder="https://…"/><span className="text-xs font-normal text-slate-500">Add a YouTube, Vimeo, or other video URL for visitors to watch.</span></label>
    </div></section>
    <section className="card p-6 md:p-7"><p className="text-xs font-bold uppercase tracking-wider text-[#147ee8]">04 · Description</p><h2 className="mt-1 text-lg font-black">Design overview</h2><label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">Description<textarea name="description" defaultValue={design?.description ?? ""} className="input min-h-32" placeholder="Explain the design concept and key features…"/></label></section>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><p role="status" className="text-sm text-slate-500">{status || "Floor and space details are optional and saved with the design."}</p><button disabled={saving} className="btn btn-primary min-w-36 disabled:opacity-60">{saving ? "Saving design…" : design ? "Save changes" : "Create design"}</button></div>
  </form>;
}
