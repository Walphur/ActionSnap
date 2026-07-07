import Link from "next/link";
import { BRAND } from "@/lib/brand";

type Props = {
  href?: string;
  size?: "sm" | "nav" | "header" | "navbar" | "md" | "lg" | "hero";
  className?: string;
};

/** nav = isotipo; navbar/header = wordmark horizontal. */
const classes: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-10 w-auto max-w-[200px]",
  nav: "h-11 w-auto max-w-[52px] sm:h-12 sm:max-w-[56px]",
  header: "h-12 w-auto max-w-[260px] sm:h-14 sm:max-w-[300px] md:h-16 md:max-w-[360px]",
  navbar:
    "brand-logo-nav h-9 w-auto max-w-[min(240px,52vw)] sm:h-10 sm:max-w-[280px] md:h-11 md:max-w-[300px]",
  md: "h-14 w-auto max-w-[320px]",
  lg: "h-16 w-auto max-w-[380px] md:h-20 md:max-w-[440px]",
  hero: "h-20 w-auto max-w-[420px] md:h-24 md:max-w-[520px]",
};

export function BrandLogo({ href = "/", size = "md", className = "" }: Props) {
  const isIsotipo = size === "nav";
  const src = isIsotipo ? BRAND.isotipoSrc : BRAND.logoSrc;
  const mark = (
    <img
      src={src}
      alt={BRAND.name}
      className={`block object-contain object-left ${classes[size]} ${className}`}
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
