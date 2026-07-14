/**
 * HD va a Cloudflare R2 desde el navegador; Render solo ve un preview chico.
 * Se pueden subir varias en paralelo sin matar la RAM del Starter.
 */
export function uploadConcurrencyForFiles(_files: File[]): number {
  return 3;
}

export function uploadConcurrencyLabel(_concurrency: number): string {
  return "HD directo a Cloudflare · varias en paralelo";
}

export function isHeavyCameraFile(file: File): boolean {
  return file.size >= 4 * 1024 * 1024;
}
