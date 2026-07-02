"use client";

import { useState } from "react";
import {
  Camera,
  Copy,
  Globe,
  MessageCircle,
  QrCode,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  buildEventShareUrl,
  buildFacebookShareUrl,
  buildQrImageUrl,
  buildWhatsAppShareUrl,
} from "@/lib/onboarding";
import { toast } from "@/components/ui/toast";

type Props = {
  eventTitle: string;
  slug: string;
  compact?: boolean;
};

export function EventSharePanel({ eventTitle, slug, compact = false }: Props) {
  const [showQr, setShowQr] = useState(false);
  const url = buildEventShareUrl(slug);
  const shareText = `Mirá las fotos de ${eventTitle} en Action Snap`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  async function copyForInstagram() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado — pegalo en Instagram Stories o tu bio");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  if (compact) {
    return (
      <div className="ds-event-share ds-event-share--compact">
        <Button type="button" variant="outline" size="sm" onClick={() => void copyLink()}>
          <Copy className="h-3.5 w-3.5" aria-hidden />
          Copiar enlace
        </Button>
        <ButtonLink
          href={buildWhatsAppShareUrl(shareText, url)}
          variant="outline"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          WhatsApp
        </ButtonLink>
      </div>
    );
  }

  return (
    <Card className="ds-event-share-card ds-dash-reveal">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
          <div>
            <h2 className="ds-h4">Compartí tu evento</h2>
            <p className="ds-caption mt-1">
              Tu evento está publicado. Compartilo para conseguir tu primera venta.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="ds-caption break-all rounded-[var(--ds-radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs">
          {url}
        </p>

        <div className="ds-event-share__actions">
          <Button type="button" variant="primary" onClick={() => void copyLink()}>
            <Copy className="h-4 w-4" aria-hidden />
            Copiar enlace
          </Button>
          <ButtonLink
            href={buildWhatsAppShareUrl(shareText, url)}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </ButtonLink>
          <ButtonLink
            href={buildFacebookShareUrl(url)}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe className="h-4 w-4" aria-hidden />
            Facebook
          </ButtonLink>
          <Button type="button" variant="secondary" onClick={() => void copyForInstagram()}>
            <Camera className="h-4 w-4" aria-hidden />
            Instagram
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowQr((v) => !v)}
            aria-expanded={showQr}
          >
            <QrCode className="h-4 w-4" aria-hidden />
            {showQr ? "Ocultar QR" : "Ver QR"}
          </Button>
        </div>

        {showQr && (
          <div className="ds-event-share__qr">
            <img
              src={buildQrImageUrl(url)}
              alt={`Código QR para ${eventTitle}`}
              width={180}
              height={180}
              className="ds-event-share__qr-img"
            />
            <p className="ds-caption text-center">Escaneá para abrir la galería</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
