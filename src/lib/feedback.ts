const PREFIX = "actionsnap_feedback_";

export type FeedbackContext = "first_sale" | "first_purchase" | "first_download";
export type FeedbackRating = "great" | "ok" | "bad";

export type StoredFeedback = {
  rating: FeedbackRating;
  comment?: string;
  submittedAt: string;
};

function key(context: FeedbackContext) {
  return `${PREFIX}${context}`;
}

export function getFeedback(context: FeedbackContext): StoredFeedback | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key(context));
    if (!raw) return null;
    return JSON.parse(raw) as StoredFeedback;
  } catch {
    return null;
  }
}

export function saveFeedback(
  context: FeedbackContext,
  rating: FeedbackRating,
  comment?: string
): void {
  if (typeof window === "undefined") return;
  const payload: StoredFeedback = {
    rating,
    comment: comment?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key(context), JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function hasFeedback(context: FeedbackContext): boolean {
  return getFeedback(context) !== null;
}
