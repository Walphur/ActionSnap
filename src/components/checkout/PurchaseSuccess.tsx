"use client";

import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { FeedbackPrompt } from "@/components/feedback/FeedbackPrompt";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PurchaseStatus } from "@/types/purchase";

export function PurchaseSuccess() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const { state, query, refresh } = usePurchaseStatus(params);

  return (
    <div className="buyer-success">
      <Card className="buyer-success__card">
        <CardBody>
          {state.status === "loading" && <LoadingView />}
          {state.status === "pending" && <PendingView isMpPending={query.isMpPending} />}
          {state.status === "paid" && <PaidView state={state} />}
          {state.status === "not_found" && <NotFoundView />}
          {state.status === "timeout" && <TimeoutView onRetry={() => void refresh()} />}
          {state.status === "error" && <ErrorView message={state.message} />}
        </CardBody>
      </Card>
    </div>
  );
}

function LoadingView() {
  return (
    <>
      <div className="buyer-success__icon buyer-success__icon--pending">
        <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
      </div>
      <h1 className="ds-h2 mt-4">Procesando pago…</h1>
      <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
        Confirmando tu compra. Esto suele tardar unos segundos.
      </p>
      <div className="mt-6 space-y-2">
        <Skeleton className="mx-auto h-4 w-48" />
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </>
  );
}

function PendingView({ isMpPending }: { isMpPending: boolean }) {
  return (
    <>
      <div className="buyer-success__icon buyer-success__icon--pending">
        <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
      </div>
      <h1 className="ds-h2 mt-4">
        {isMpPending ? "Pago pendiente" : "Confirmando pago…"}
      </h1>
      <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
        {isMpPending
          ? "Mercado Pago está procesando tu pago. Te avisamos acá cuando esté listo."
          : "Casi listo. Esperando la confirmación final."}
      </p>
      <p className="ds-caption mt-4">No cierres esta pantalla.</p>
    </>
  );
}

function PaidView({
  state,
}: {
  state: Extract<PurchaseStatus, { status: "paid" }>;
}) {
  const count = state.downloads.length;

  return (
    <>
      <div className="buyer-success__icon buyer-success__icon--success ds-animate-scale-in">
        <CheckCircle2 className="h-10 w-10" aria-hidden />
      </div>
      <h1 className="ds-h2 mt-4 ds-animate-fade-in">¡Pago confirmado!</h1>
      <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
        {count === 1
          ? "Tu foto en HD está lista."
          : `Tus ${count} fotos en HD están listas.`}
      </p>

      {state.zipUrl && count > 1 && (
        <div className="mt-6">
          <ButtonLink href={state.zipUrl} variant="primary" className="w-full">
            <Package className="h-5 w-5" aria-hidden />
            Descargar ZIP ({count})
          </ButtonLink>
        </div>
      )}

      <ul className="buyer-success__downloads">
        {state.downloads.map((photo) => (
          <li key={photo.photoId} className="buyer-success__download-item">
            <img src={photo.previewUrl} alt="" className="buyer-success__thumb" loading="lazy" />
            <a href={photo.downloadUrl} download={photo.fileName}>
              <Button type="button" variant="secondary" size="sm">
                <Download className="h-4 w-4" aria-hidden />
                HD
              </Button>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2">
        <ButtonLink
          href={`/descargas?purchase_id=${state.purchaseId}`}
          variant="primary"
          className="w-full"
        >
          <Download className="h-4 w-4" aria-hidden />
          Ir a Mis descargas
        </ButtonLink>
        <ButtonLink href="/mis-compras" variant="secondary" className="w-full">
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Mis compras
        </ButtonLink>
        <ButtonLink href="/explorar" variant="ghost" className="w-full">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Explorar más eventos
        </ButtonLink>
      </div>

      <FeedbackPrompt context="first_purchase" className="mt-8" title="¿Cómo fue tu compra?" />
    </>
  );
}

function NotFoundView() {
  return (
    <>
      <h1 className="ds-h2">Compra no encontrada</h1>
      <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
        No pudimos identificar tu pago. Revisá el link o buscá en Mis compras.
      </p>
      <ButtonLink href="/mis-compras" variant="primary" className="mt-6 w-full">
        Ir a Mis compras
      </ButtonLink>
    </>
  );
}

function TimeoutView({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <h1 className="ds-h2">Sigue en proceso</h1>
      <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">
        El pago puede tardar un poco más. Podés volver en unos minutos.
      </p>
      <Button type="button" variant="primary" className="mt-6 w-full" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" aria-hidden />
        Reintentar ahora
      </Button>
      <ButtonLink href="/mis-compras" variant="secondary" className="mt-3 w-full">
        Ir a Mis compras
      </ButtonLink>
    </>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <>
      <h1 className="ds-h2">No pudimos verificar el pago</h1>
      <p className="ds-body-lg mt-2 text-[var(--color-text-secondary)]">{message}</p>
      <ButtonLink href="/mis-compras" variant="primary" className="mt-6 w-full">
        Ver Mis compras
      </ButtonLink>
    </>
  );
}
