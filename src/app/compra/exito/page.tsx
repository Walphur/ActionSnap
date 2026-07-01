import { Suspense } from "react";
import { PurchaseSuccess } from "@/components/checkout/PurchaseSuccess";

export default function CompraExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-10 text-center text-white/60">
          Cargando…
        </div>
      }
    >
      <PurchaseSuccess />
    </Suspense>
  );
}
