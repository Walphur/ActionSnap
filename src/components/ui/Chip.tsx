import { X } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  selected?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
};

export function Chip({
  selected = false,
  onRemove,
  removeLabel = "Quitar",
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span className={cn("ds-chip", className)} data-selected={selected || undefined} {...props}>
      {children}
      {onRemove && (
        <button type="button" className="ds-chip__remove" onClick={onRemove} aria-label={removeLabel}>
          <X size={14} aria-hidden />
        </button>
      )}
    </span>
  );
}
