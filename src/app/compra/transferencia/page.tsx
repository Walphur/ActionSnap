import { Suspense } from "react";
import { PurchaseTransfer } from "@/components/checkout/PurchaseTransfer";

export default function CompraTransferenciaPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-10 text-center text-white/60">Cargando…</div>
      }
    >
      <PurchaseTransfer />
    </Suspense>
  );
}
