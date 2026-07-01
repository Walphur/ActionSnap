import { Suspense } from "react";
import { PhotographerDashboard } from "@/components/photographer/PhotographerDashboard";

export default function PhotographerPanelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/60">Cargando panel…</div>}>
      <PhotographerDashboard />
    </Suspense>
  );
}
