export const MAX_REVIEW_IMAGES = 5;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const HOME_FEED_LIMIT = 20;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const REVIEW_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif";

export type HomeFeedTab = "latest" | "following";

export function parseHomeFeedTab(value: string | undefined): HomeFeedTab {
  return value === "following" ? "following" : "latest";
}
