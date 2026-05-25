import Link from "next/link";
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
      <div className="card mx-auto max-w-md px-8 py-12 text-center">
        <p className="text-[var(--muted)]">
          El pago aún no está confirmado. Esperá unos segundos y recargá la página.
        </p>
      </div>
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
      <div className="card mx-auto max-w-md px-8 py-12 text-center">
        <p className="text-[var(--muted)]">Procesando tu compra… Recargá en unos segundos.</p>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("purchase_items")
    .select("photo_id, photos(cloudinary_public_id, preview_url, original_url)")
    .eq("purchase_id", purchase.id);

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-bold">Tus descargas</h1>
      <p className="mb-8 text-[var(--muted)]">
        Archivos en alta resolución, listos para guardar.
      </p>
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
              className="card flex items-center justify-between gap-4 p-4"
            >
              <img
                src={photo.preview_url}
                alt=""
                className="h-20 w-28 rounded-lg object-cover"
              />
              <a href={url} download className="btn-primary shrink-0 !py-2.5 !text-sm">
                Descargar HD
              </a>
            </li>
          );
        })}
      </ul>
      <Link href="/" className="btn-secondary mt-10 inline-flex">
        Volver al inicio
      </Link>
    </div>
  );
}
