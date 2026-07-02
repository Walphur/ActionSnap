export type PhotoTag = {
  number: string;
  confidence?: number | null;
};

export type GalleryPhoto = {
  id: string;
  preview_url: string;
  original_url?: string | null;
  is_sold?: boolean;
  bike_color?: string | null;
  rider_color?: string | null;
  photo_numbers?: PhotoTag[];
};
