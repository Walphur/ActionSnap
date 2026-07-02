export type EventRow = {
  id: string;
  slug: string;
  title: string;
  sport: string;
  event_date: string;
  is_published: boolean;
  photoCount: number;
  price_per_photo_cents: number;
};

export type DashboardOverview = {
  eventsCount: number;
  photoCount: number;
  salesCount: number;
  sellerTotalLabel: string;
  totalRevenueLabel: string;
  mpConnected: boolean;
  recentSales: { id: string; email: string; amountCents: number; createdAt: string }[];
};
