"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Smile, Meh, Frown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  hasFeedback,
  saveFeedback,
  type FeedbackContext,
  type FeedbackRating,
} from "@/lib/feedback";

const RATINGS: {
  id: FeedbackRating;
  label: string;
  icon: typeof Smile;
}[] = [
  { id: "great", label: "Excelente", icon: Smile },
  { id: "ok", label: "Normal", icon: Meh },
  { id: "bad", label: "Tuve problemas", icon: Frown },
];

type Props = {
  context: FeedbackContext;
  title?: string;
  className?: string;
};

export function FeedbackPrompt({
  context,
  title = "¿Cómo fue tu experiencia?",
  className,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setVisible(!hasFeedback(context));
  }, [context]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
  }

  function submit() {
    if (!rating) return;
    saveFeedback(context, rating, comment);
    setSubmitted(true);
    setTimeout(() => setVisible(false), 2800);
  }

  if (submitted) {
    return (
      <Card className={className}>
        <CardBody>
          <p className="ds-body text-center text-[var(--color-text-secondary)]">
            Gracias por tu feedback. Lo usaremos para mejorar la beta.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardBody className="ds-feedback">
        <div className="ds-feedback__head">
          <MessageSquare className="h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
          <p className="ds-body font-semibold">{title}</p>
        </div>

        <div className="ds-feedback__ratings" role="group" aria-label="Calificación">
          {RATINGS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`ds-feedback__rating ${rating === id ? "ds-feedback__rating--active" : ""}`}
              onClick={() => setRating(id)}
              aria-pressed={rating === id}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <label className="ds-field">
          <span className="ds-field__label">Comentario (opcional)</span>
          <textarea
            className="ds-input ds-feedback__textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contanos qué funcionó bien o qué mejorarías…"
          />
        </label>

        <div className="ds-feedback__actions">
          <Button type="button" variant="primary" size="sm" disabled={!rating} onClick={submit}>
            Enviar feedback
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
            Ahora no
          </Button>
        </div>

        <p className="ds-caption text-[var(--color-text-disabled)]">
          Beta cerrada — el feedback se guarda en este dispositivo hasta conectar el envío automático.
        </p>
      </CardBody>
    </Card>
  );
}
