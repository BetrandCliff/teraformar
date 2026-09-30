import type { Design, Project } from "@/lib/data";
import { typeormRequest } from "@/lib/typeorm";

type ProjectRow = { id: string; slug: string; title: string; data: Record<string, unknown> };

const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const text = (value: unknown): string => typeof value === "string" ? value : "";

export function toProject(row: ProjectRow): Project {
  const data = row.data ?? {};
  return {
    ...data,
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: text(data.location),
    category: data.category === "Commercial" ? "Commercial" : "Residential",
    status: data.status === "Completed" || data.status === "In Progress" ? data.status : "Published",
    year: Number(data.year ?? new Date().getFullYear()),
    area: text(data.area),
    landSize: text(data.landSize),
    image: text(data.image),
    gallery: strings(data.gallery),
    floorPlans: strings(data.floorPlans),
    architecturalDrawings: strings(data.architecturalDrawings),
    structuralDrawings: strings(data.structuralDrawings),
    documents: strings(data.documents),
    description: text(data.description),
    bedrooms: Number(data.bedrooms ?? 0),
    bathrooms: Number(data.bathrooms ?? 0),
    floors: Number(data.floors ?? 1),
    duration: text(data.duration),
  } as Project;
}

export function toDesign(row: ProjectRow): Design {
  const project = toProject(row);
  const data = row.data ?? {};
  return {
    ...project,
    modelUrl: text(data.modelUrl),
    parkingSpaces: Number(data.parkingSpaces ?? 0),
    kitchens: Number(data.kitchens ?? 1),
    livingRooms: Number(data.livingRooms ?? 1),
    diningRooms: Number(data.diningRooms ?? 1),
    dimensions: text(data.dimensions),
    estimatedConstruction: text(data.estimatedConstruction),
    interiorImages: strings(data.interiorImages),
    specifications: strings(data.specifications),
  };
}

export async function getProjects(): Promise<Project[]> {
  const rows = await typeormRequest<ProjectRow[]>("projects", { query: "?select=*&order=created_at.desc" });
  return rows.map(toProject);
}

export async function getDesigns(): Promise<Design[]> {
  const rows = await typeormRequest<ProjectRow[]>("designs", { query: "?select=*&order=created_at.desc" });
  return rows.map(toDesign);
}
