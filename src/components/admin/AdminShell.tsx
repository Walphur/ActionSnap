"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-12">
      <div className="card mb-8 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <BrandLogo size="md" href="/" />
          <p className="mt-3 text-sm font-medium">Panel del fotógrafo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="btn-secondary !py-2 !text-sm">
            Sitio público
          </Link>
          <form action="/api/admin/login" method="post" className="inline">
            <button
              type="button"
              className="btn-secondary !py-2 !text-sm"
              onClick={async () => {
                await fetch("/api/admin/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "logout" }),
                });
                window.location.href = "/admin/login";
              }}
            >
              Salir
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
