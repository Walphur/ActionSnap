import Link from "next/link";
import { BRAND } from "@/lib/brand";

type Props = {
  href?: string;
  size?: "sm" | "nav" | "md" | "lg" | "hero";
  className?: string;
};

const heights = { sm: 32, nav: 42, md: 44, lg: 64, hero: 96 } as const;

export function BrandLogo({ href = "/", size = "md", className = "" }: Props) {
  const h = heights[size];
  const src = size === "nav" ? BRAND.isotipoSrc : BRAND.logoSrc;
  const mark = (
    <img
      src={src}
      alt={BRAND.name}
      height={h}
      className={`w-auto object-contain ${className}`}
      style={{ height: h, maxWidth: "100%" }}
    />
  );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-block transition opacity-95 hover:opacity-100">
      {mark}
    </Link>
  );
}
