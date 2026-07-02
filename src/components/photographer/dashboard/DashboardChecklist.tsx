import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { OnboardingComplete } from "@/components/photographer/onboarding/OnboardingComplete";
import {
  buildOnboardingChecklist,
  isOnboardingComplete,
} from "@/lib/onboarding-checklist";
import type { DashboardOverview, EventRow } from "@/types/event";

type Props = {
  overview: DashboardOverview | null;
  events: EventRow[];
  mpReceiverId: string;
  photographerName: string;
};

export function DashboardChecklist({
  overview,
  events,
  mpReceiverId,
  photographerName,
}: Props) {
  const items = buildOnboardingChecklist(overview, events, mpReceiverId, photographerName);
  const allDone = isOnboardingComplete(items);
  const pending = items.filter((i) => !i.done);
  const doneCount = items.filter((i) => i.done).length;

  if (allDone) {
    return <OnboardingComplete />;
  }

  return (
    <Card className="ds-dash-reveal">
      <CardHeader>
        <h2 className="ds-h4">Primeros pasos</h2>
        <p className="ds-caption mt-1">
          {doneCount}/{items.length} completados · {pending.length} pendiente
          {pending.length === 1 ? "" : "s"}
        </p>
      </CardHeader>
      <CardBody>
        <ul className="ds-dash-checklist__items">
          {items.map((item) => (
            <li
              key={item.id}
              className={`ds-dash-checklist__item ${item.done ? "ds-dash-checklist__item--done" : ""}`}
            >
              {item.done ? (
                <CheckCircle2 className="ds-dash-checklist__icon h-5 w-5 shrink-0" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-[var(--color-text-disabled)]" aria-hidden />
              )}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
