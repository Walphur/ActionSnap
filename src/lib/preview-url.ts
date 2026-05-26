type PhotoUrls = {
  id: string;
  preview_url: string;
  original_url: string;
};

/** URL para galería pública (marca de agua). Seguro en cliente y servidor. */
export function getDisplayPreviewUrl(photo: PhotoUrls): string {
  if (photo.preview_url && photo.preview_url !== photo.original_url) {
    return photo.preview_url;
  }
  return `/api/watermark?photoId=${photo.id}`;
}
