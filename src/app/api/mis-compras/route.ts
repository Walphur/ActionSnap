import { NextResponse } from "next/server";
import { z } from "zod";
import { createDownloadToken } from "@/lib/download-token";
import { getClientIp } from "@/lib/get-client-ip";
import {
  getPaidPurchasesByEmail,
  getPurchasePhotos,
} from "@/lib/purchase-downloads";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";

const bodySchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`mis-compras:${ip}`, 8, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos. Probá en unos minutos." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
      );
    }

    const json = await request.json();
    const { email, turnstileToken } = bodySchema.parse(json);

    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "Verificá que no sos un robot e intentá de nuevo." },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const purchases = await getPaidPurchasesByEmail(supabase, email);

    const results = await Promise.all(
      purchases.map(async (p) => {
        const photos = await getPurchasePhotos(supabase, p.id);
        const token = await createDownloadToken(p.id);
        return {
          id: p.id,
          createdAt: p.created_at,
          photoCount: photos.length,
          amountCents: p.amount_cents,
          downloadUrl: `/descargas?purchase_id=${p.id}`,
          zipUrl: `/api/download/zip?token=${encodeURIComponent(token)}`,
        };
      })
    );

    return NextResponse.json({ purchases: results });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
