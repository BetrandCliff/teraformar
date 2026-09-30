import PageHero from "@/components/PageHero";
import DesignCard from "@/components/DesignCard";
import { getDesigns } from "@/lib/projects";
export const dynamic = "force-dynamic";

export default async function Designs() {
  const designs = await getDesigns();
  return <><PageHero title="3D Designs" subtitle="Explore architectural concepts through immersive digital visualization."/><section className="section"><div className="container"><div className="mb-8 max-w-xl"><p className="text-sm leading-7 text-slate-500">Explore the layout, proportions and details of each concept before taking the next step.</p></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{designs.map((design) => <DesignCard key={design.slug} d={design}/>)}</div></div></section></>;
}
