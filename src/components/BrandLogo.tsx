import Link from "next/link";
import { BRAND } from "@/lib/brand";

type Props = {
  href?: string;
  size?: "sm" | "nav" | "md" | "lg" | "hero";
  className?: string;
};

const heights = { sm: 48, nav: 80, md: 72, lg: 96, hero: 200 } as const;

export function BrandLogo({ href = "/", size = "md", className = "" }: Props) {
  const h = heights[size];
  const img = (
    // img nativo: evita chunks de next/image y fondo negro del PNG
    <img
      src={BRAND.logoSrc}
      alt={BRAND.name}
      height={h}
      className={`w-auto object-contain ${className}`}
      style={{ height: h, maxWidth: "100%" }}
    />
  );

  if (!href) return img;

  return (
    <Link href={href} className="inline-block transition opacity-95 hover:opacity-100">
      {img}
    </Link>
  );
}
