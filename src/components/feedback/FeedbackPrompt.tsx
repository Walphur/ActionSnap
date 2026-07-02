"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  hasFeedback,
  saveFeedback,
  type FeedbackContext,
  type FeedbackRating,
} from "@/lib/feedback";

const RATINGS: { id: FeedbackRating; label: string; stars: number }[] = [
  { id: "excellent", label: "Excelente", stars: 5 },
  { id: "good", label: "Buena", stars: 4 },
  { id: "regular", label: "Regular", stars: 3 },
  { id: "bad", label: "Mala", stars: 2 },
  { id: "terrible", label: "Muy mala", stars: 1 },
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

        <p className="ds-caption text-center text-[var(--color-text-secondary)]" aria-hidden>
          ★★★★★
        </p>

        <div className="ds-feedback__ratings ds-feedback__ratings--5" role="group" aria-label="Calificación">
          {RATINGS.map(({ id, label, stars }) => (
            <button
              key={id}
              type="button"
              className={`ds-feedback__rating ${rating === id ? "ds-feedback__rating--active" : ""}`}
              onClick={() => setRating(id)}
              aria-pressed={rating === id}
            >
              <span className="ds-feedback__stars" aria-hidden>
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <label className="ds-field">
          <span className="ds-field__label">Comentario (opcional)</span>
          <textarea
            className="ds-input ds-feedback__textarea"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contanos qué funcionó bien o qué mejorarías…"
          />
        </label>

        <div className="ds-feedback__actions">
          <Button type="button" variant="primary" size="sm" disabled={!rating} onClick={submit}>
            Enviar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
            Ahora no
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
