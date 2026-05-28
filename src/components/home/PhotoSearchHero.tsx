"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type EventOption = { id: string; slug: string; title: string };

type Props = {
  events: EventOption[];
};

export function PhotoSearchHero({ events }: Props) {
  const [searchNumber, setSearchNumber] = useState("");
  const [searchEventId, setSearchEventId] = useState("");

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === searchEventId) ?? null,
    [events, searchEventId]
  );

  return (
    <section id="buscar" className="search-hero-section site-content">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55 }}
        className="search-hero-panel glass-panel glow-accent"
      >
        <p className="search-hero-kicker">Buscá tus fotos</p>
        <h2 className="font-display search-hero-title">Encontrá tus fotos</h2>
        <p className="search-hero-lead">
          Marketplace deportivo · búsqueda por dorsal · descarga instantánea en HD
        </p>

        <form
          className="search-hero-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedEvent) return;
            const n = searchNumber.trim();
            const q = n ? `?numero=${encodeURIComponent(n)}` : "";
            window.location.href = `/eventos/${selectedEvent.slug}${q}`;
          }}
        >
          <div className="search-hero-field search-hero-field--event">
            <label htmlFor="search-event">Evento</label>
            <select
              id="search-event"
              value={searchEventId}
              onChange={(e) => setSearchEventId(e.target.value)}
              className="field-input field-input--search"
            >
              <option value="">Seleccionar evento</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
          <div className="search-hero-field">
            <label htmlFor="search-dorsal">Número / dorsal</label>
            <input
              id="search-dorsal"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder="Ej. 27"
              inputMode="numeric"
              className="field-input field-input--search field-input--dorsal"
            />
          </div>
          <button
            type="submit"
            className="btn-hero btn-hero--primary search-hero-submit"
            disabled={!selectedEvent}
          >
            Buscar fotos
          </button>
        </form>
        <p className="search-hero-hint">
          Próximamente: búsqueda por piloto, fecha, reconocimiento facial y OCR de números.
        </p>
      </motion.div>
    </section>
  );
}
