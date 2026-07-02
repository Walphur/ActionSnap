"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PhotographerShell } from "@/components/photographer/PhotographerShell";
import { DashboardEventsTab } from "@/components/photographer/dashboard/DashboardEventsTab";
import { DashboardOverviewTab } from "@/components/photographer/dashboard/DashboardOverviewTab";
import { DashboardSettingsTab } from "@/components/photographer/dashboard/DashboardSettingsTab";
import { DashboardUploadTab } from "@/components/photographer/dashboard/DashboardUploadTab";
import { Alert } from "@/components/ui/Alert";
import { usePhotographerDashboard } from "@/hooks/usePhotographerDashboard";

type Tab = "overview" | "events" | "upload" | "settings";

export function PhotographerDashboard() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
  const [status, setStatus] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);

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
    uploading,
    uploadProgress,
    setActiveSlug,
    setMpReceiverId,
    loadData,
    createEvent,
    uploadPhotos,
    saveMpReceiverId,
  } = usePhotographerDashboard(notify);

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
      notify(`No se pudo vincular Mercado Pago (${reason}).`, false);
    }
  }, [searchParams, loadData, notify]);

  async function onCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await createEvent(new FormData(e.currentTarget));
    if (result.ok) {
      setTab("upload");
    }
  }

  async function onUploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const files = fd.getAll("photos") as File[];
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
      {status && (
        <Alert tone={statusOk ? "success" : "danger"} title={statusOk ? "Listo" : "Error"} className="mb-6">
          <span className="whitespace-pre-wrap">{status}</span>
          {statusOk && activeSlug && (
            <p className="mt-2">
              <Link href={`/eventos/${activeSlug}`} className="text-[var(--color-primary)] hover:underline">
                Ver galería pública →
              </Link>
            </p>
          )}
        </Alert>
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
          onSelectEvent={selectEvent}
          onNavigateUpload={() => setTab("upload")}
          onCreateEvent={onCreateEvent}
        />
      )}

      {tab === "upload" && (
        <DashboardUploadTab
          events={events}
          activeSlug={activeSlug}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onActiveSlugChange={setActiveSlug}
          onUploadPhotos={onUploadPhotos}
        />
      )}

      {tab === "settings" && (
        <DashboardSettingsTab
          mpConnected={overview?.mpConnected ?? false}
          mpReceiverId={mpReceiverId}
          mpSaving={mpSaving}
          onSaveMpManual={() => void saveMpReceiverId()}
          onMpIdChange={setMpReceiverId}
          onStatus={notify}
        />
      )}
    </PhotographerShell>
  );
}
