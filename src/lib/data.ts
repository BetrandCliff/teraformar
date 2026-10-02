export type Project = {
  id: string; slug: string; title: string; location: string;
  category: "Residential" | "Commercial"; status: "Completed" | "In Progress" | "Published";
  year: number; area: string; landSize?: string; image: string; gallery: string[];
  floorPlans: string[]; architecturalDrawings: string[]; structuralDrawings: string[];
  documents: string[]; description: string; bedrooms: number; bathrooms: number;
  floors: number; duration: string; floorDetails?: DesignFloor[];
};
export type DesignRoom = {
  name?: string;
  type?: string;
  area?: string;
  notes?: string;
};
export type DesignFloor = {
  label?: string;
  area?: string;
  rooms: DesignRoom[];
};
export type Design = Project & {
  modelUrl?: string; parkingSpaces: number; kitchens: number; livingRooms: number;
  diningRooms: number; dimensions: string; estimatedConstruction: string;
  interiorImages: string[]; specifications: string[];
  floorDetails?: DesignFloor[];
};

const seeds: Omit<Project, "id">[] = [
  { slug:"modern-luxury-villa", title:"Modern Luxury Villa", location:"Yaoundé, Cameroon", category:"Residential", status:"Completed", year:2026, area:"450 m²", landSize:"900 m²", image:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85", gallery:["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85"], floorPlans:[], architecturalDrawings:[], structuralDrawings:[], documents:[], description:"A contemporary family residence combining generous daylight, clean geometry and warm natural materials.", bedrooms:5, bathrooms:6, floors:2, duration:"14 months" },
  { slug:"office-complex", title:"Office Complex", location:"Douala, Cameroon", category:"Commercial", status:"Completed", year:2025, area:"1,200 m²", landSize:"1,800 m²", image:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85", gallery:["https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85"], floorPlans:[], architecturalDrawings:[], structuralDrawings:[], documents:[], description:"A modern commercial development designed around efficient circulation, flexible workspaces and a strong street presence.", bedrooms:0, bathrooms:8, floors:4, duration:"18 months" },
  { slug:"family-residence", title:"Family Residence", location:"Buea, Cameroon", category:"Residential", status:"In Progress", year:2026, area:"320 m²", landSize:"650 m²", image:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85", gallery:["https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85"], floorPlans:[], architecturalDrawings:[], structuralDrawings:[], documents:[], description:"A comfortable family home designed for privacy, natural ventilation and modern living.", bedrooms:4, bathrooms:4, floors:2, duration:"12 months" },
  { slug:"commercial-complex", title:"Commercial Complex", location:"Limbe, Cameroon", category:"Commercial", status:"Completed", year:2024, area:"980 m²", landSize:"1,500 m²", image:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85", gallery:[], floorPlans:[], architecturalDrawings:[], structuralDrawings:[], documents:[], description:"A mixed-use commercial complex with adaptable retail and office spaces.", bedrooms:0, bathrooms:6, floors:3, duration:"16 months" },
  { slug:"modern-duplex", title:"Modern Duplex", location:"Buea, Cameroon", category:"Residential", status:"Published", year:2026, area:"410 m²", landSize:"700 m²", image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85", gallery:[], floorPlans:[], architecturalDrawings:[], structuralDrawings:[], documents:[], description:"A refined two-level residence with open living areas and carefully framed exterior views.", bedrooms:4, bathrooms:5, floors:2, duration:"13 months" },
  { slug:"minimalist-home", title:"Minimalist Home", location:"Yaoundé, Cameroon", category:"Residential", status:"Published", year:2026, area:"280 m²", landSize:"500 m²", image:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85", gallery:[], floorPlans:[], architecturalDrawings:[], structuralDrawings:[], documents:[], description:"A minimalist home focused on simplicity, proportion and functional spaces.", bedrooms:3, bathrooms:3, floors:1, duration:"10 months" },
];
export const projects: Project[] = seeds.map((project,index)=>({id:`p${index+1}`,...project}));
export const designs: Design[] = projects.map((project,index)=>({...project,id:`d${index+1}`,title:`${project.title} Concept`,parkingSpaces:index%2?8:2,kitchens:1,livingRooms:1,diningRooms:1,dimensions:"18 × 22 m",estimatedConstruction:project.duration,interiorImages:project.gallery,specifications:[]}));
export const services = [
  {title:"Architectural Design",text:"Concept development, floor plans and architectural visualization for residential and commercial projects."},
  {title:"Building Construction",text:"Professional construction delivery from planning and site preparation through completion."},
  {title:"3D Visualization",text:"Photorealistic 3D concepts that help clients understand their project before construction."},
  {title:"Renovation",text:"Modernization and transformation of existing residential and commercial spaces."},
  {title:"Project Management",text:"Coordinating people, timelines, materials and delivery milestones."},
  {title:"Interior Design",text:"Functional and refined interior concepts that complement the architecture."},
];
