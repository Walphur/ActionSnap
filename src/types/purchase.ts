export type DownloadItem = {
  photoId: string;
  previewUrl: string;
  downloadUrl: string;
  fileName: string;
};

export type PurchaseStatus =
  | { status: "loading" }
  | { status: "pending"; purchaseId?: string }
  | { status: "paid"; purchaseId: string; downloads: DownloadItem[]; zipUrl: string | null }
  | { status: "not_found" }
  | { status: "timeout" }
  | { status: "error"; message: string };
