import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import DesignEditor from "@/components/DesignEditor";
import { getDesigns } from "@/lib/projects";
export const dynamic = "force-dynamic";

export default async function EditDesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const designs = await getDesigns();
  const design = designs.find((item) => item.id === id);
  if (!design) return notFound();
  return (
    <div className="admin-content">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-[#147ee8] transition hover:gap-3"
        href="/admin/3d-designs"
      >
        <ArrowLeft size={16} />
        3D Designs
      </Link>
      <p className="mt-5 text-sm font-semibold text-[#147ee8]">
        Design library
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">
        Edit 3D design
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Update specifications and media for{" "}
        <span className="font-semibold">{design.title}</span>.
      </p>
      <DesignEditor design={design} />
    </div>
  );
}
