import { NextResponse } from "next/server";
import { createDownloadToken } from "@/lib/download-token";
import { sendPurchaseEmail } from "@/lib/email";
import { requirePhotographerProfile } from "@/lib/photographer-auth";
import { PLATFORM } from "@/lib/platform";
import { createServiceClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id: purchaseId } = await params;
    const photographer = await requirePhotographerProfile();
    const supabase = createServiceClient();

    const { data: purchase } = await supabase
      .from("purchases")
      .select("id, status, email, photographer_id")
      .eq("id", purchaseId)
      .maybeSingle();

    if (!purchase || purchase.photographer_id !== photographer.id) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }

    if (purchase.status !== "paid") {
      return NextResponse.json({ error: "La compra aun no esta pagada" }, { status: 422 });
    }

    const email = purchase.email?.trim();
    if (!email) {
      return NextResponse.json({ error: "La compra no tiene email" }, { status: 422 });
    }

    const { data: item } = await supabase
      .from("purchase_items")
      .select("photos(events(title))")
      .eq("purchase_id", purchaseId)
      .limit(1)
      .maybeSingle();

    const eventTitle =
      (item?.photos as { events?: { title?: string } } | null)?.events?.title ?? PLATFORM.name;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const downloadToken = await createDownloadToken(purchaseId);
    const downloadUrl = `${appUrl}/descargas?purchase_id=${purchaseId}&token=${encodeURIComponent(downloadToken)}`;

    await sendPurchaseEmail(email, downloadUrl, eventTitle, `${appUrl}/mis-compras`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
