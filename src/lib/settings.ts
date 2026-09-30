import "server-only";
import { typeormRequest } from "@/lib/typeorm";
export type AboutStat = { value: string; label: string };
export type AboutValue = { title: string; description: string };
export type SiteSettings = {
  companyName: string;
  email: string;
  phone: string;
  location: string;
  logoImage: string;
  homeHeroImage: string;
  aboutImage: string;
  bannerImage: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutStoryLabel: string;
  aboutStoryTitle: string;
  aboutStory: string;
  aboutStats: AboutStat[];
  aboutValuesLabel: string;
  aboutValuesTitle: string;
  aboutValues: AboutValue[];
};

export const defaultSiteSettings: SiteSettings = {
  companyName: "BuildVision",
  email: "hello@buildvision.cm",
  phone: "+237 6XX XXX XXX",
  location: "Buea, Cameroon",
  logoImage: "",
  homeHeroImage: "",
  aboutImage: "",
  bannerImage: "",
  aboutTitle: "About Us",
  aboutSubtitle: "Building dreams, creating lasting value.",
  aboutStoryLabel: "Our Story",
  aboutStoryTitle: "Construction with clarity from concept to completion.",
  aboutStory: "BuildVision is a construction and architectural design business focused on thoughtful planning, quality execution and modern visualization. Our approach combines practical construction knowledge with 3D design so clients can make confident decisions early.",
  aboutStats: [
    { value: "100+", label: "Projects" },
    { value: "50+", label: "Happy Clients" },
    { value: "5+", label: "Years Experience" },
    { value: "10+", label: "Professionals" },
  ],
  aboutValuesLabel: "Our Values",
  aboutValuesTitle: "Principles behind every project.",
  aboutValues: [
    { title: "Quality", description: "We make decisions with long-term value and client needs in mind." },
    { title: "Integrity", description: "We communicate clearly and take responsibility for our work." },
    { title: "Innovation", description: "We use thoughtful design and modern tools to solve real problems." },
    { title: "Customer Focus", description: "We listen carefully and keep each client's goals at the center." },
  ],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await typeormRequest<{ data: Partial<SiteSettings> }[]>("site_settings", { query: "?id=eq.1&select=data" });
    return { ...defaultSiteSettings, ...rows[0]?.data };
  } catch {
    return defaultSiteSettings;
  }
}
