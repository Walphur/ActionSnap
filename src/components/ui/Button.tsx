import { Loader2 } from "lucide-react";
import { cn, type DsSize, type DsVariant } from "@/lib/ui/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DsVariant;
  size?: DsSize;
  loading?: boolean;
  legacyClass?: "btn-primary" | "btn-secondary" | "btn-ghost";
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  legacyClass,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "ds-btn",
        `ds-btn--${variant}`,
        size !== "md" && `ds-btn--${size}`,
        legacyClass,
        className
      )}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
