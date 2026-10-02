import type { Design, DesignFloor, DesignRoom, Project } from "@/lib/data";
import { typeormRequest } from "@/lib/typeorm";

type ProjectRow = { id: string; slug: string; title: string; data: Record<string, unknown> };

const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const text = (value: unknown): string => typeof value === "string" ? value : "";
const floorDetails = (value: unknown): DesignFloor[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((floor): floor is Record<string, unknown> => !!floor && typeof floor === "object").map((floor) => ({
    label: text(floor.label),
    area: text(floor.area),
    rooms: Array.isArray(floor.rooms) ? floor.rooms.filter((room): room is Record<string, unknown> => !!room && typeof room === "object").map((room): DesignRoom => ({
      name: text(room.name), type: text(room.type), area: text(room.area), notes: text(room.notes),
    })) : [],
  }));
};

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
    floorDetails: floorDetails(data.floorDetails),
    duration: text(data.duration),
  } as Project;
}

export function toDesign(row: ProjectRow): Design {
  const project = toProject(row);
  const data = row.data ?? {};
  const savedFloors = Array.isArray(data.floorDetails)
    ? floorDetails(data.floorDetails)
    : Array.from({ length: Math.min(Math.max(project.floors, 0), 20) }, (_, index) => ({
        label: index === 0 ? "Ground floor" : `Floor ${index + 1}`,
        rooms: [],
      }));
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
    floorDetails: savedFloors,
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
