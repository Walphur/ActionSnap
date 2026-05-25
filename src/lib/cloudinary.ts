import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/** URL de vista previa con marca de agua para no descargar sin pagar */
export function previewUrl(publicId: string) {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 1200, crop: "limit", quality: "auto" },
      {
        overlay: {
          font_family: "Arial",
          font_size: 48,
          font_weight: "bold",
          text: "MOTO FOTOS",
        },
        opacity: 40,
        gravity: "center",
      },
    ],
  });
}

/** URL firmada de descarga en alta resolución (solo tras pago) */
export function signedDownloadUrl(publicId: string, expiresInSeconds = 3600) {
  configureCloudinary();
  return cloudinary.utils.private_download_url(publicId, "jpg", {
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
}
