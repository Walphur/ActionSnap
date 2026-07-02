import Link from "next/link";
import { cn, type DsSize, type DsVariant } from "@/lib/ui/cn";

export type ButtonLinkProps = Omit<React.ComponentProps<typeof Link>, "className"> & {
  variant?: DsVariant;
  size?: DsSize;
  className?: string;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "ds-btn ds-pressable",
        `ds-btn--${variant}`,
        size !== "md" && `ds-btn--${size}`,
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
