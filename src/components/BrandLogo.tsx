import Link from "next/link";
import { BRAND } from "@/lib/brand";

type Props = {
  href?: string;
  size?: "sm" | "nav" | "md" | "lg" | "hero";
  className?: string;
};

const heights = { sm: 36, nav: 56, md: 48, lg: 72, hero: 110 } as const;

export function BrandLogo({ href = "/", size = "md", className = "" }: Props) {
  const h = heights[size];
  const isNav = size === "nav";
  const src = isNav ? BRAND.isotipoSrc : BRAND.logoSrc;
  const mark = (
    <img
      src={src}
      alt={BRAND.name}
      height={h}
      className={`w-auto object-contain object-left ${isNav ? "min-h-[44px] min-w-[44px] md:min-h-[52px] md:min-w-[52px]" : ""} ${className}`}
      style={{ height: h, maxWidth: isNav ? "140px" : "100%" }}
    />
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center transition opacity-95 hover:opacity-100 ${isNav ? "py-1" : ""}`}
      aria-label={BRAND.name}
    >
      {mark}
    </Link>
  );
}
