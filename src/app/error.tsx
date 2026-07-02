"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg">
      <CardBody>
        <EmptyState
          icon={AlertTriangle}
          title="Algo falló"
          description="Suele arreglarse reiniciando el servidor. En la terminal: npm run dev:clean"
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
