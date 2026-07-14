const MB = 1024 * 1024;

/**
 * Render Starter = 512 MB. Una sola foto 6000×4000 con Sharp + watermark ya pelea por la RAM.
 * Siempre 1 a la vez: se pueden encolar 1000, pero nunca en paralelo en el servidor.
 */
export function uploadConcurrencyForFiles(_files: File[]): number {
  return 1;
}

export function uploadConcurrencyLabel(_concurrency: number): string {
  return "1 foto a la vez (cola estable · podés seleccionar cientos)";
}

export function isHeavyCameraFile(file: File): boolean {
  return file.size >= 4 * MB;
}
