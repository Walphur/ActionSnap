"use client";

import { useSearchParams } from "next/navigation";
import { PurchaseQrPayment } from "@/components/checkout/PurchaseQrPayment";

export function PurchaseQr() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  return <PurchaseQrPayment searchParams={params} />;
}
