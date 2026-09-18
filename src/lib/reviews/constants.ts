/** 一覧カードに表示する本文プレビューの最大文字数 */
export const REVIEW_BODY_PREVIEW_LENGTH = 40;

/** ホーム・ギア詳細の初回件数 */
export const HOME_FEED_LIMIT = 20;

/** 「もっと見る」で追加する件数 */
export const REVIEW_FEED_LOAD_MORE = 10;

/** プロフィール上に出す最新投稿数 */
export const PROFILE_REVIEW_PREVIEW_LIMIT = 5;

export const MAX_REVIEW_IMAGES = 5;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

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

export function truncateReviewBody(
  body: string,
  maxLength = REVIEW_BODY_PREVIEW_LENGTH,
): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}…`;
}
