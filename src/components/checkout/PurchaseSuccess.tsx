"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Loader2,
  Package,
  RefreshCw,
} from "lucide-react";

type DownloadItem = {
  photoId: string;
  previewUrl: string;
  downloadUrl: string;
  fileName: string;
};

type PurchaseStatus =
  | { status: "loading" }
  | { status: "pending"; purchaseId?: string }
  | { status: "paid"; purchaseId: string; downloads: DownloadItem[]; zipUrl: string | null }
  | { status: "not_found" }
  | { status: "timeout" }
  | { status: "error"; message: string };

const POLL_MS = 3000;
const MAX_POLLS = 40;

export function PurchaseSuccess() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<PurchaseStatus>({ status: "loading" });
  const [pollCount, setPollCount] = useState(0);

  const query = useMemo(() => {
    const purchaseId = searchParams.get("purchase_id");
    const preferenceId =
      searchParams.get("preference_id") ?? searchParams.get("preference-id");
    const paymentId =
      searchParams.get("payment_id") ?? searchParams.get("collection_id");
    const pending = searchParams.get("pending");

    const params = new URLSearchParams();
    if (purchaseId) params.set("purchase_id", purchaseId);
    if (preferenceId) params.set("preference_id", preferenceId);
    if (paymentId) params.set("payment_id", paymentId);

    return {
      qs: params.toString(),
      hasIdentifier: Boolean(purchaseId || preferenceId),
      isMpPending: pending === "1",
    };
  }, [searchParams]);

  const fetchStatus = useCallback(async () => {
    if (!query.hasIdentifier) {
      setState({ status: "not_found" });
      return false;
    }

    try {
      const res = await fetch(`/api/purchases/status?${query.qs}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok && data.status === "not_found") {
        setState({ status: "not_found" });
        return false;
      }

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error ?? "No se pudo verificar el pago",
        });
        return false;
      }

      if (data.status === "paid") {
        setState({
          status: "paid",
          purchaseId: data.purchaseId,
          downloads: data.downloads ?? [],
          zipUrl: data.zipUrl ?? null,
        });
        return false;
      }

      if (data.status === "pending") {
        setState({ status: "pending", purchaseId: data.purchaseId });
        return true;
      }

      setState({
        status: "error",
        message: `Estado de pago: ${data.status}`,
      });
      return false;
    } catch {
      setState({ status: "error", message: "Error de conexión. Revisá tu señal." });
      return false;
    }
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      const shouldContinue = await fetchStatus();
      if (cancelled) return;

      if (!shouldContinue) return;

      intervalId = setInterval(async () => {
        setPollCount((n) => n + 1);
        const keepGoing = await fetchStatus();
        if (!keepGoing || cancelled) {
          if (intervalId) clearInterval(intervalId);
        }
      }, POLL_MS);
    }

    void poll();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchStatus]);

  useEffect(() => {
    if (state.status === "pending" && pollCount >= MAX_POLLS) {
      setState({ status: "timeout" });
    }
  }, [pollCount, state.status]);

  return (
    <div className="purchase-success mx-auto w-full max-w-md px-4 py-6 sm:py-10">
      <div className="purchase-success-card">
        {state.status === "loading" && <LoadingView />}
        {state.status === "pending" && <PendingView isMpPending={query.isMpPending} />}
        {state.status === "paid" && <PaidView state={state} />}
        {state.status === "not_found" && <NotFoundView />}
        {state.status === "timeout" && <TimeoutView onRetry={() => void fetchStatus()} />}
        {state.status === "error" && <ErrorView message={state.message} />}
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <>
      <div className="purchase-success-icon purchase-success-icon--pending">
        <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
      </div>
      <h1 className="purchase-success-title">Procesando pago…</h1>
      <p className="purchase-success-lead">
        Estamos confirmando tu compra con Mercado Pago. Esto suele tardar unos segundos.
      </p>
      <div className="purchase-success-skeleton" aria-hidden>
        <div className="purchase-success-skeleton-line" />
        <div className="purchase-success-skeleton-line purchase-success-skeleton-line--short" />
      </div>
    </>
  );
}

function PendingView({ isMpPending }: { isMpPending: boolean }) {
  return (
    <>
      <div className="purchase-success-icon purchase-success-icon--pending">
        <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
      </div>
      <h1 className="purchase-success-title">
        {isMpPending ? "Pago pendiente de acreditación" : "Confirmando pago…"}
      </h1>
      <p className="purchase-success-lead">
        {isMpPending
          ? "Mercado Pago está procesando tu pago. Te avisamos acá cuando esté listo."
          : "Casi listo. Estamos esperando la confirmación final del pago."}
      </p>
      <p className="purchase-success-hint">No cierres esta pantalla.</p>
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
      <div className="purchase-success-icon purchase-success-icon--success">
        <CheckCircle2 className="h-10 w-10" aria-hidden />
      </div>
      <h1 className="purchase-success-title purchase-success-title--success">
        ¡Pago confirmado!
      </h1>
      <p className="purchase-success-lead">
        {count === 1
          ? "Tu foto en HD está lista para descargar."
          : `Tus ${count} fotos en HD están listas para descargar.`}
      </p>

      <div className="purchase-success-actions">
        {state.zipUrl && count > 1 && (
          <a href={state.zipUrl} className="btn-primary purchase-success-btn w-full">
            <Package className="h-5 w-5" aria-hidden />
            Descargar todo en ZIP ({count})
          </a>
        )}
      </div>

      <ul className="purchase-success-downloads">
        {state.downloads.map((photo) => (
          <li key={photo.photoId} className="purchase-success-download-item">
            <img
              src={photo.previewUrl}
              alt=""
              className="purchase-success-thumb"
              loading="lazy"
            />
            <a
              href={photo.downloadUrl}
              download={photo.fileName}
              className="btn-primary purchase-success-btn purchase-success-btn--compact"
            >
              <Download className="h-4 w-4" aria-hidden />
              HD
            </a>
          </li>
        ))}
      </ul>

      <div className="purchase-success-footer">
        <Link
          href={`/descargas?purchase_id=${state.purchaseId}`}
          className="btn-secondary w-full"
        >
          Ver en Mis descargas
        </Link>
        <Link href="/mis-compras" className="btn-ghost w-full text-sm">
          Historial de compras
        </Link>
      </div>
    </>
  );
}

function NotFoundView() {
  return (
    <>
      <h1 className="purchase-success-title">Compra no encontrada</h1>
      <p className="purchase-success-lead">
        No pudimos identificar tu pago. Revisá el link o buscá en Mis compras.
      </p>
      <Link href="/mis-compras" className="btn-primary w-full">
        Ir a Mis compras
      </Link>
    </>
  );
}

function TimeoutView({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <h1 className="purchase-success-title">Sigue en proceso</h1>
      <p className="purchase-success-lead">
        El pago puede tardar un poco más. Guardamos tu compra y podés volver en unos minutos.
      </p>
      <button type="button" onClick={onRetry} className="btn-primary w-full">
        <RefreshCw className="h-4 w-4" aria-hidden />
        Reintentar ahora
      </button>
      <Link href="/mis-compras" className="btn-secondary mt-3 w-full">
        Ir a Mis compras
      </Link>
    </>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <>
      <h1 className="purchase-success-title">No pudimos verificar el pago</h1>
      <p className="purchase-success-lead">{message}</p>
      <Link href="/mis-compras" className="btn-primary w-full">
        Ver Mis compras
      </Link>
    </>
  );
}
