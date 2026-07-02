import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn, type DsTone } from "@/lib/ui/cn";

const ICONS: Record<Exclude<DsTone, "default">, LucideIcon> = {
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
  info: Info,
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: Exclude<DsTone, "default">;
  title?: string;
};

export function Alert({ tone = "info", title, className, children, ...props }: AlertProps) {
  const Icon = ICONS[tone];

  return (
    <div className={cn("ds-alert", `ds-alert--${tone}`, className)} role="alert" {...props}>
      <Icon size={20} aria-hidden className="shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-1" : undefined}>{children}</div>}
      </div>
    </div>
  );
}
