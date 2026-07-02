"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui/Button";

export type DropdownItem = {
  id: string;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type DropdownProps = {
  triggerLabel: string;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
};

export function Dropdown({ triggerLabel, items, align = "start", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={cn("ds-dropdown", className)} ref={rootRef}>
      <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {triggerLabel}
        <ChevronDown size={16} aria-hidden />
      </Button>
      {open && (
        <div
          className="ds-dropdown__menu"
          role="menu"
          style={align === "end" ? { right: 0 } : { left: 0 }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="ds-dropdown__item"
              data-disabled={item.disabled || undefined}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                item.onSelect?.();
                setOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
