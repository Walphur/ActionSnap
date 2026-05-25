import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { signedDownloadUrl } from "@/lib/cloudinary";
import { hasCloudinary } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function DownloadsPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (!session_id) notFound();

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return (
      <p className="text-center text-[var(--muted)]">
        El pago aún no está confirmado. Esperá unos segundos y recargá.
      </p>
    );
  }

  const supabase = createServiceClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_session_id", session_id)
    .eq("status", "paid")
    .single();

  if (!purchase) {
    return (
      <p className="text-center text-[var(--muted)]">
        Procesando tu compra… Recargá en unos segundos.
      </p>
    );
  }

  const { data: items } = await supabase
    .from("purchase_items")
    .select("photo_id, photos(cloudinary_public_id, preview_url, original_url)")
    .eq("purchase_id", purchase.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tus descargas</h1>
      <ul className="space-y-4">
        {(items ?? []).map((item) => {
          const raw = item.photos;
          const photo = (Array.isArray(raw) ? raw[0] : raw) as {
            cloudinary_public_id: string;
            preview_url: string;
            original_url: string;
          } | null;
          if (!photo?.original_url) return null;
          const url = hasCloudinary()
            ? signedDownloadUrl(photo.cloudinary_public_id)
            : photo.original_url;
          return (
            <li
              key={item.photo_id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4"
            >
              <img
                src={photo.preview_url}
                alt=""
                className="h-16 w-24 rounded object-cover"
              />
              <a
                href={url}
                download
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black"
              >
                Descargar HD
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
