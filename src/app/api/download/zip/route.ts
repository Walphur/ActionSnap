import archiver from "archiver";
import { PassThrough } from "stream";
import { Readable } from "stream";
import { verifyDownloadToken } from "@/lib/download-token";
import { fetchImageBuffer } from "@/lib/fetch-image";
import { getClientIp } from "@/lib/get-client-ip";
import { getPaidPurchase, getPurchasePhotos } from "@/lib/purchase-downloads";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`zip:${ip}`, 10, 60 * 60 * 1000);
    if (!limited.ok) {
      return new Response("Demasiadas descargas. Probá más tarde.", { status: 429 });
    }

    const token = new URL(request.url).searchParams.get("token");
    const purchaseId = await verifyDownloadToken(token);
    if (!purchaseId) {
      return new Response("Link inválido o expirado.", { status: 403 });
    }

    const supabase = createServiceClient();
    const purchase = await getPaidPurchase(supabase, purchaseId);
    if (!purchase) {
      return new Response("Compra no encontrada o no pagada.", { status: 404 });
    }

    const photos = await getPurchasePhotos(supabase, purchaseId);
    if (photos.length === 0) {
      return new Response("No hay fotos para descargar.", { status: 404 });
    }

    const passThrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(passThrough);

    archive.on("error", (err) => {
      passThrough.destroy(err);
    });

    for (const photo of photos) {
      const { buffer } = await fetchImageBuffer(photo.downloadUrl);
      archive.append(buffer, { name: photo.fileName });
    }

    void archive.finalize();

    const webStream = Readable.toWeb(passThrough) as ReadableStream;

    return new Response(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="action-snap-${purchaseId.slice(0, 8)}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Error al generar el ZIP.", { status: 500 });
  }
}
