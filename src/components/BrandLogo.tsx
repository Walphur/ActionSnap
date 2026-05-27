import Link from "next/link";
import { BRAND } from "@/lib/brand";

export type LogoVariant = "horizontal" | "full" | "square" | "icon";

type Props = {
  href?: string;
  variant?: LogoVariant;
  height?: number;
  className?: string;
  priority?: boolean;
};

const DEFAULT_HEIGHT: Record<LogoVariant, number> = {
  horizontal: 52,
  full: 88,
  square: 120,
  icon: 64,
};

const SRC: Record<LogoVariant, string> = {
  horizontal: BRAND.logo.horizontal,
  full: BRAND.logo.full,
  square: BRAND.logo.square,
  icon: BRAND.logo.icon,
};

export function BrandLogo({
  href = "/",
  variant = "horizontal",
  height,
  className = "",
  priority = false,
}: Props) {
  const h = height ?? DEFAULT_HEIGHT[variant];
  const img = (
    <img
      src={SRC[variant]}
      alt={BRAND.name}
      height={h}
      width={variant === "square" || variant === "icon" ? h : undefined}
      className={`w-auto object-contain ${className}`}
      style={{ height: h, maxWidth: "100%" }}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );

  if (!href) return img;

  return (
    <Link href={href} className="inline-block transition opacity-95 hover:opacity-100">
      {img}
    </Link>
  );
}
