"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/toast";

type Props = {
  title: string;
  url: string;
};

export function EventHeroShare({ title, url }: Props) {
  async function share() {
    const shareData = {
      title,
      text: `Mirá las fotos de ${title} en Action Snap`,
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles");
    } catch {
      toast.error("No se pudo compartir el link");
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => void share()} className="!text-white !border-white/20">
      <Share2 className="h-4 w-4" aria-hidden />
      Compartir
    </Button>
  );
}
