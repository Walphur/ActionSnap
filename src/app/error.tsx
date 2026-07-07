"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getContactEmail } from "@/lib/contact";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const supportEmail = getContactEmail();

  return (
    <Card className="mx-auto max-w-lg">
      <CardBody>
        <EmptyState
          icon={AlertTriangle}
          title="No pudimos cargar esta página"
          description={`Puede ser un problema temporal de conexión. Reintentá en unos segundos. Si sigue pasando, escribinos a ${supportEmail}.`}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" variant="primary" onClick={reset}>
                Reintentar
              </Button>
              <ButtonLink href="/" variant="secondary">
                Ir al inicio
              </ButtonLink>
            </div>
          }
        />
      </CardBody>
    </Card>
  );
}
