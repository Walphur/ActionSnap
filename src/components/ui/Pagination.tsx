"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={cn("ds-pagination", className)} aria-label="Paginación">
      <button
        type="button"
        className="ds-pagination__btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} aria-hidden />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className="ds-pagination__btn"
          data-selected={p === page || undefined}
          aria-current={p === page ? "page" : undefined}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="ds-pagination__btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}
