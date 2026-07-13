import { FileQuestion } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <section className="not-found-page">
      <Card className="not-found-page__card">
        <CardBody>
          <EmptyState
            icon={FileQuestion}
            title="Página no encontrada"
            description="El enlace puede estar roto o el contenido ya no está disponible. Volvé al inicio o explorá eventos activos."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink href="/" variant="primary">
                  Ir al inicio
                </ButtonLink>
                <ButtonLink href="/explorar" variant="secondary">
                  Explorar eventos
                </ButtonLink>
                <ButtonLink href="/mis-compras" variant="ghost">
                  Mis compras
                </ButtonLink>
              </div>
            }
          />
        </CardBody>
      </Card>
    </section>
  );
}
