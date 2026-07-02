import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("ds-empty", className)}>
      <Icon className="ds-empty__icon" size={40} aria-hidden />
      <h3 className="ds-empty__title">{title}</h3>
      {description && <p className="ds-empty__desc">{description}</p>}
      {action}
    </div>
  );
}
