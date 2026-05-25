export async function fetchImageBuffer(imageUrl: string) {
  const res = await fetch(imageUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo descargar la imagen (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") ?? "image/jpeg";
  return { buffer: buf, mime, base64: buf.toString("base64") };
}
