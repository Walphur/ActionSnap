import { Loader2 } from "lucide-react";
import { cn, type DsSize } from "@/lib/ui/cn";

export type SpinnerProps = {
  size?: DsSize;
  className?: string;
  label?: string;
};

export function Spinner({ size = "md", className, label = "Cargando" }: SpinnerProps) {
  return (
    <Loader2
      className={cn("ds-spinner", `ds-spinner--${size}`, className)}
      aria-label={label}
      role="status"
    />
  );
}
