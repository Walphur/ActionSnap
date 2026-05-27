"use client";

import { formatSportLabel } from "@/lib/platform";

type Props = {
  sports: string[];
  active: string;
  onChange: (sport: string) => void;
};

export function EventSportFilter({ sports, active, onChange }: Props) {
  const all = ["todos", ...sports];

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
            active === s
              ? "border-[var(--accent)] bg-[var(--accent)] text-black"
              : "border-white/15 bg-white/5 text-white/70 hover:border-white/35 hover:text-white"
          }`}
        >
          {s === "todos" ? "Todos" : formatSportLabel(s)}
        </button>
      ))}
    </div>
  );
}
