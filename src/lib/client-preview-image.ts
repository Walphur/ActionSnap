/** Preview liviano en el navegador (~1200px). El HD va directo a R2. */

export type ClientPreviewResult = {
  blob: Blob;
  width: number;
  height: number;
};

const PREVIEW_MAX = 1200;
const PREVIEW_QUALITY = 0.82;

export async function makeClientPreview(file: File): Promise<ClientPreviewResult> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, PREVIEW_MAX / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");
      ctx.drawImage(bitmap, 0, 0, width, height);
      const blob = await canvasToJpeg(canvas, PREVIEW_QUALITY);
      return { blob, width: bitmap.width, height: bitmap.height };
    } finally {
      bitmap.close();
    }
  }

  return loadViaImageElement(file);
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo crear preview JPEG"))),
      "image/jpeg",
      quality
    );
  });
}

function loadViaImageElement(file: File): Promise<ClientPreviewResult> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const scale = Math.min(1, PREVIEW_MAX / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas no disponible");
        ctx.drawImage(img, 0, 0, width, height);
        const blob = await canvasToJpeg(canvas, PREVIEW_QUALITY);
        resolve({ blob, width: img.naturalWidth, height: img.naturalHeight });
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

export function isJpegFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    type.includes("jpeg") ||
    type === "image/jpg"
  );
}
