import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// Cargar .env.local antes de leer la URL de Supabase
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHost: string | null = null;
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).hostname;
} catch {
  supabaseHost = null;
}

const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "res.cloudinary.com" },
];

if (supabaseHost) {
  imageRemotePatterns.push({
    protocol: "https",
    hostname: supabaseHost,
    pathname: "/storage/v1/object/public/**",
  });
}

// Tu proyecto (por si .env no se leyó al arrancar)
if (!supabaseHost || supabaseHost !== "nvifhjygnsxjdqillist.supabase.co") {
  imageRemotePatterns.push({
    protocol: "https",
    hostname: "nvifhjygnsxjdqillist.supabase.co",
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageRemotePatterns,
  },
  // Tesseract usa workers en node_modules (no empaquetar con webpack)
  serverExternalPackages: ["tesseract.js", "tesseract.js-core"],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
