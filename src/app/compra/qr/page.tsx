import { Suspense } from "react";
import { PurchaseQr } from "@/components/checkout/PurchaseQr";

export default function CompraQrPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-10 text-center text-white/60">Cargando…</div>
      }
    >
      <PurchaseQr />
    </Suspense>
  );
}
