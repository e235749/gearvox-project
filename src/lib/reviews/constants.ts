export const MAX_REVIEW_IMAGES = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const HOME_FEED_LIMIT = 20;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export type HomeFeedTab = "latest" | "following";

export function parseHomeFeedTab(value: string | undefined): HomeFeedTab {
  return value === "following" ? "following" : "latest";
}
