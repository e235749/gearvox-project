import { truncateReviewBody } from "@/lib/reviews/constants";

/** @deprecated 一覧では title + bodyPreview を別表示する */
export function formatReviewHeadline(
  title: string | null,
  body: string,
  maxLength = 40,
): string {
  if (title?.trim()) {
    return title;
  }
  return truncateReviewBody(body, maxLength);
}

export function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
