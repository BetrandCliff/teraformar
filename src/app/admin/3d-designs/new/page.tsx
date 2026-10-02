import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DesignEditor from "@/components/DesignEditor";

export default function NewDesignPage() {
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
        Create a 3D design
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Add specifications, upload your cover image and attach an optional GLB
        model.
      </p>
      <DesignEditor />
    </div>
  );
}
