import type { Metadata } from "next";
import { Suspense } from "react";
import { RacerPurchasesPanel } from "@/components/racer/RacerPurchasesPanel";
import { PLATFORM } from "@/lib/platform";

export const metadata: Metadata = {
  title: `Mis compras — ${PLATFORM.name}`,
  description:
    "Accedé a todas tus fotos deportivas en HD. Ingresá con magic link o Google usando el email de tu compra.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function MisComprasPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg">
          <div className="card h-40 animate-pulse bg-[var(--surface)]" />
        </div>
      }
    >
      <RacerPurchasesPanel urlError={error ?? null} />
    </Suspense>
  );
}
