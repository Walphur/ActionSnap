import type { PhotoWithNumbers } from "@/lib/types";

export type PhotoSortOrder = "default" | "dorsal-asc" | "dorsal-desc" | "newest";

export function sortPhotos(photos: PhotoWithNumbers[], order: PhotoSortOrder): PhotoWithNumbers[] {
  if (order === "default") return photos;

  const copy = [...photos];

  if (order === "newest") {
    return copy.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const dorsal = (p: PhotoWithNumbers) => {
    const n = p.photo_numbers?.[0]?.number;
    return n ? parseInt(n.replace(/\D/g, ""), 10) || 0 : 99999;
  };

  if (order === "dorsal-asc") {
    return copy.sort((a, b) => dorsal(a) - dorsal(b));
  }

  return copy.sort((a, b) => dorsal(b) - dorsal(a));
}
