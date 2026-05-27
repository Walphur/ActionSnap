import Link from "next/link";
import { BRAND } from "@/lib/brand";

type Props = {
  href?: string;
  size?: "sm" | "nav" | "md" | "lg" | "hero";
  className?: string;
};

const heights = { sm: 32, nav: 42, md: 38, lg: 50, hero: 72 } as const;

export function BrandLogo({ href = "/", size = "md", className = "" }: Props) {
  const h = heights[size];
  const mark = (
    <span
      className={`inline-flex items-center rounded-lg border border-white/15 bg-black/35 px-3 py-1 font-display font-extrabold uppercase tracking-[0.16em] text-white ${className}`}
      style={{ fontSize: Math.max(12, Math.floor(h * 0.35)), lineHeight: 1.1 }}
      aria-label={BRAND.name}
    >
      Action Snap
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-block transition opacity-95 hover:opacity-100">
      {mark}
    </Link>
  );
}
