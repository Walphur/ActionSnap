import { cn, type DsTone } from "@/lib/ui/cn";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: DsTone;
};

export function Badge({ tone = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn("ds-badge", tone !== "default" && `ds-badge--${tone}`, className)}
      {...props}
    >
      {children}
    </span>
  );
}
