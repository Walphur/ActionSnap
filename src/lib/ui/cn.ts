export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type DsSize = "sm" | "md" | "lg";
export type DsVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type DsTone = "default" | "success" | "warning" | "danger" | "info";
