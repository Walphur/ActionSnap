"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  openId?: string | null;
  onToggle?: (id: string) => void;
  className?: string;
};

export function Accordion({ items, openId = null, onToggle, className }: AccordionProps) {
  return (
    <div className={cn(className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="ds-accordion__item">
            <button
              type="button"
              className="ds-accordion__trigger"
              aria-expanded={open}
              onClick={() => onToggle?.(item.id)}
            >
              <span>{item.title}</span>
              <ChevronDown
                size={18}
                aria-hidden
                style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform var(--duration-normal)" }}
              />
            </button>
            {open && <div className="ds-accordion__content">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
