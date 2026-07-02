import { Badge } from "@/components/ui/Badge";
import {
  EVENT_STATUS_LABELS,
  getEventVisualStatus,
  type EventVisualStatus,
} from "@/lib/event-readiness";
import type { EventRow } from "@/types/event";

type Props = {
  event: EventRow;
  taggedCount?: number;
  mpConnected?: boolean;
  status?: EventVisualStatus;
  className?: string;
};

export function EventStatusBadge({
  event,
  taggedCount = 0,
  mpConnected = false,
  status,
  className,
}: Props) {
  const resolved =
    status ?? getEventVisualStatus(event, { taggedCount, mpConnected });
  const meta = EVENT_STATUS_LABELS[resolved];

  return (
    <Badge tone={meta.tone} className={className}>
      <span aria-hidden>{meta.emoji}</span> {meta.label}
    </Badge>
  );
}
