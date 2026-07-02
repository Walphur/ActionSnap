"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PurchaseStatus } from "@/types/purchase";
import type { CheckoutQueryState } from "@/types/checkout";

const POLL_MS = 3000;
const MAX_POLLS = 40;

export function buildCheckoutQuery(searchParams: URLSearchParams): CheckoutQueryState {
  const purchaseId = searchParams.get("purchase_id");
  const sessionId = searchParams.get("session_id");
  const preferenceId = searchParams.get("preference_id") ?? searchParams.get("preference-id");
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");
  const pending = searchParams.get("pending");
  const accessToken = searchParams.get("token");

  const params = new URLSearchParams();
  if (purchaseId) params.set("purchase_id", purchaseId);
  if (sessionId) params.set("session_id", sessionId);
  if (preferenceId) params.set("preference_id", preferenceId);
  if (paymentId) params.set("payment_id", paymentId);
  if (accessToken) params.set("token", accessToken);

  return {
    qs: params.toString(),
    hasIdentifier: Boolean(purchaseId || preferenceId || sessionId),
    isMpPending: pending === "1",
  };
}

export function usePurchaseStatus(searchParams: URLSearchParams) {
  const [state, setState] = useState<PurchaseStatus>({ status: "loading" });
  const [pollCount, setPollCount] = useState(0);

  const query = useMemo(() => buildCheckoutQuery(searchParams), [searchParams]);

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

  return { state, query, refresh: fetchStatus };
}
