export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  cover_url: string | null;
  is_published: boolean;
  sport?: string | null;
  price_per_photo_cents: number;
  pack_discount_percent?: number;
};

export type Photo = {
  id: string;
  event_id: string;
  cloudinary_public_id: string;
  preview_url: string;
  original_url: string;
  width: number | null;
  height: number | null;
  ai_status: string;
  bike_color?: string | null;
  rider_color?: string | null;
  ai_labels?: string[] | null;
  created_at: string;
  photo_numbers?: { number: string; confidence: number | null }[];
};

export type PhotoWithNumbers = Photo & {
  photo_numbers: { number: string; confidence: number | null }[];
};
