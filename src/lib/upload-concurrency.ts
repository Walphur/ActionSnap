const MB = 1024 * 1024;

/** Evita OOM/timeouts en Render free con JPG pesados de cámara (~10–25 MB). */
export function uploadConcurrencyForFiles(files: File[]): number {
  if (files.length === 0) return 1;

  const maxBytes = Math.max(...files.map((f) => f.size));
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const maxMb = maxBytes / MB;
  const totalMb = totalBytes / MB;

  if (maxMb >= 8 || totalMb >= 24) return 1;
  if (maxMb >= 4 || totalMb >= 12) return 2;
  return 3;
}

export function uploadConcurrencyLabel(concurrency: number): string {
  if (concurrency <= 1) return "1 foto a la vez (archivos pesados)";
  if (concurrency === 2) return "hasta 2 en paralelo";
  return "hasta 3 en paralelo";
}
