"use client";

import { cn } from "@/lib/ui/cn";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ items, value, onChange, className }: TabsProps) {
  const active = items.find((t) => t.id === value) ?? items[0];

  return (
    <div className={cn(className)}>
      <div className="ds-tabs__list" role="tablist">
        {items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={tab.id === value}
            aria-controls={`panel-${tab.id}`}
            data-selected={tab.id === value || undefined}
            className="ds-tabs__trigger"
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="ds-tabs__panel"
        role="tabpanel"
        id={`panel-${active?.id}`}
        aria-labelledby={`tab-${active?.id}`}
      >
        {active?.content}
      </div>
    </div>
  );
}
