"use client";

import { FeedbackPrompt } from "@/components/feedback/FeedbackPrompt";

export function DownloadsFeedback() {
  return (
    <FeedbackPrompt
      context="first_download"
      className="mt-8"
      title="¿Pudiste descargar tus fotos sin problemas?"
    />
  );
}
