"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PhotographerShell } from "@/components/photographer/PhotographerShell";
import { DashboardEventsTab } from "@/components/photographer/dashboard/DashboardEventsTab";
import { DashboardOverviewTab } from "@/components/photographer/dashboard/DashboardOverviewTab";
import { DashboardSettingsTab } from "@/components/photographer/dashboard/DashboardSettingsTab";
import { DashboardUploadTab } from "@/components/photographer/dashboard/DashboardUploadTab";
import { FirstSaleCelebration } from "@/components/photographer/onboarding/FirstSaleCelebration";
import { FeedbackPrompt } from "@/components/feedback/FeedbackPrompt";
import { Alert } from "@/components/ui/Alert";
import { useOnboardingTips } from "@/hooks/useOnboardingTips";
import { usePhotographerDashboard } from "@/hooks/usePhotographerDashboard";

type Tab = "overview" | "events" | "upload" | "settings";

export function PhotographerDashboard() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
  const [status, setStatus] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);
  const { shouldShow, dismiss } = useOnboardingTips();

  const notify = useCallback((msg: string, ok: boolean) => {
    setStatus(msg);
    setStatusOk(ok);
  }, []);

  const {
    events,
    overview,
    activeSlug,
    mpReceiverId,
    photographerName,
    mpSaving,
    creating,
    uploading,
    uploadProgress,
    setActiveSlug,
    setMpReceiverId,
    loadData,
    createEvent,
    uploadPhotos,
    saveMpReceiverId,
  } = usePhotographerDashboard(notify);

  const hasSales = (overview?.recentSales.length ?? 0) > 0;

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (
      requestedTab === "settings" ||
      requestedTab === "overview" ||
      requestedTab === "events" ||
      requestedTab === "upload"
    ) {
      setTab(requestedTab);
    }

    const mpStatus = searchParams.get("mp");
    if (mpStatus === "connected") {
      notify("Mercado Pago vinculado correctamente.", true);
      loadData();
    } else if (mpStatus === "error") {
      const reason = searchParams.get("reason") ?? "desconocido";
      const hint =
        reason.includes("MERCADOPAGO_CLIENT_ID") ||
        reason.includes("redirect") ||
        reason.includes("preparada")
          ? " En Ajustes vas a ver la Redirect URI exacta: pegala en el panel de Mercado Pago (URLs de redireccionamiento) y reintentá."
          : "";
      notify(`No se pudo vincular Mercado Pago: ${reason}.${hint}`, false);
    }
  }, [searchParams, loadData, notify]);

  async function onCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await createEvent(new FormData(e.currentTarget));
    if (result.ok) {
      setTab("upload");
    }
  }

  async function onUploadFiles(files: File[]) {
    await uploadPhotos(files);
  }

  function selectEvent(slug: string, title: string) {
    setActiveSlug(slug);
    notify(`Evento activo: ${title}`, true);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Resumen" },
    { id: "events", label: "Eventos" },
    { id: "upload", label: "Subir" },
    { id: "settings", label: "Ajustes" },
  ];

  return (
    <PhotographerShell tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as Tab)}>
      <FirstSaleCelebration
        hasSales={hasSales}
        shareSlug={events.find((e) => e.is_published)?.slug}
        shareTitle={events.find((e) => e.is_published)?.title}
      />

      {status && (
        <Alert tone={statusOk ? "success" : "danger"} title={statusOk ? "Listo" : "Revisá esto"} className="mb-6">
          <span className="whitespace-pre-wrap">{status}</span>
          {statusOk && activeSlug && (
            <p className="mt-2">
              <Link href={`/eventos/${activeSlug}`} className="text-[var(--color-primary)] hover:underline">
                Ver galería pública
              </Link>
            </p>
          )}
        </Alert>
      )}

      {tab === "overview" && hasSales && (
        <FeedbackPrompt context="first_sale" className="mb-6" />
      )}

      {tab === "overview" && (
        <DashboardOverviewTab
          overview={overview}
          events={events}
          photographerName={photographerName}
          mpReceiverId={mpReceiverId}
          mpSaving={mpSaving}
          activeSlug={activeSlug}
          uploading={uploading}
          uploadProgress={uploadProgress}
          showSalesTip={shouldShow("tab-overview")}
          onDismissSalesTip={() => dismiss("tab-overview")}
          onNavigate={setTab}
          onSelectEvent={selectEvent}
          onSaveMpManual={() => void saveMpReceiverId()}
          onMpIdChange={setMpReceiverId}
        />
      )}

      {tab === "events" && (
        <DashboardEventsTab
          events={events}
          activeSlug={activeSlug}
          creating={creating}
          showEventsTip={shouldShow("tab-events")}
          onDismissEventsTip={() => dismiss("tab-events")}
          onSelectEvent={selectEvent}
          onNavigateUpload={() => setTab("upload")}
          onCreateEvent={onCreateEvent}
        />
      )}

      {tab === "upload" && (
        <DashboardUploadTab
          events={events}
          activeSlug={activeSlug}
          mpConnected={overview?.mpConnected ?? false}
          uploading={uploading}
          uploadProgress={uploadProgress}
          showUploadTip={shouldShow("tab-upload")}
          showTaggingTip={shouldShow("tagging")}
          onDismissUploadTip={() => dismiss("tab-upload")}
          onDismissTaggingTip={() => dismiss("tagging")}
          onNavigateEvents={() => setTab("events")}
          onActiveSlugChange={setActiveSlug}
          onUploadFiles={onUploadFiles}
          onRefresh={() => void loadData()}
        />
      )}

      {tab === "settings" && (
        <DashboardSettingsTab
          mpConnected={overview?.mpConnected ?? false}
          mpReceiverId={mpReceiverId}
          mpSaving={mpSaving}
          showSettingsTip={shouldShow("tab-settings")}
          showMpTip={shouldShow("mercadopago")}
          onDismissSettingsTip={() => dismiss("tab-settings")}
          onDismissMpTip={() => dismiss("mercadopago")}
          onSaveMpManual={() => void saveMpReceiverId()}
          onMpIdChange={setMpReceiverId}
          onStatus={notify}
        />
      )}
    </PhotographerShell>
  );
}
