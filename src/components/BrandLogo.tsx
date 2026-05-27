import Link from "next/link";
import { BRAND } from "@/lib/brand";

type Props = {
  href?: string;
  size?: "sm" | "nav" | "header" | "md" | "lg" | "hero";
  className?: string;
};

/** header = logo completo en nav; nav = isotipo AS (favicon contexts). */
const classes: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-10 w-auto max-w-[180px]",
  nav: "h-12 w-auto max-w-[56px] sm:h-14 sm:max-w-[64px]",
  header: "h-12 w-auto max-w-[220px] sm:h-14 sm:max-w-[260px] md:h-16 md:max-w-[300px]",
  md: "h-14 w-auto max-w-[280px]",
  lg: "h-20 w-auto max-w-[340px] md:h-24 md:max-w-[400px]",
  hero: "h-24 w-auto max-w-[360px] md:h-32 md:max-w-[480px]",
};

export function BrandLogo({ href = "/", size = "md", className = "" }: Props) {
  const isIsotipo = size === "nav";
  const src = isIsotipo ? BRAND.isotipoSrc : BRAND.logoSrc;
  const mark = (
    <img
      src={src}
      alt={BRAND.name}
      className={`object-contain object-left ${classes[size]} ${className}`}
    />
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center transition hover:opacity-90"
      aria-label={BRAND.name}
    >
      {mark}
    </Link>
  );
}
