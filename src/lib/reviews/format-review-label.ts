export function formatReviewHeadline(
  title: string | null,
  body: string,
  maxLength = 80,
): string {
  if (title?.trim()) {
    return title;
  }
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}…`;
}

export function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
