import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_REVIEW_IMAGES,
} from "@/lib/reviews/constants";

export interface CreateReviewInput {
  gearId: string;
  title: string;
  body: string;
  rating: number;
  images: File[];
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function parseCreateReviewForm(formData: FormData): CreateReviewInput {
  const ratingValue = Number(formData.get("rating"));
  const images = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  return {
    gearId: String(formData.get("gear_id") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    rating: Number.isFinite(ratingValue) ? ratingValue : 0,
    images,
  };
}

export function validateCreateReviewInput(
  input: CreateReviewInput,
): string | null {
  if (!input.gearId) {
    return "ギアを選択してください。";
  }
  if (!isUuid(input.gearId)) {
    return "選択したギアが不正です。";
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return "星評価は1〜5の整数で選択してください。";
  }
  if (!input.body) {
    return "レビュー本文を入力してください。";
  }
  if (input.body.length > 5000) {
    return "レビュー本文は5000文字以内で入力してください。";
  }
  if (input.title.length > 100) {
    return "タイトルは100文字以内で入力してください。";
  }
  if (input.images.length > MAX_REVIEW_IMAGES) {
    return `画像は最大${MAX_REVIEW_IMAGES}枚まで添付できます。`;
  }

  for (const image of input.images) {
    if (!ALLOWED_IMAGE_TYPES.includes(
      image.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )) {
      return "画像形式は JPEG / PNG / WebP / GIF のみ対応しています。";
    }
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return "画像サイズは1枚あたり5MB以内にしてください。";
    }
  }

  return null;
}

export interface UpdateReviewInput {
  reviewId: string;
  title: string;
  body: string;
  rating: number;
  images: File[];
}

export function parseUpdateReviewForm(formData: FormData): UpdateReviewInput {
  const ratingValue = Number(formData.get("rating"));
  const images = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  return {
    reviewId: String(formData.get("review_id") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    rating: Number.isFinite(ratingValue) ? ratingValue : 0,
    images,
  };
}

function validateReviewContent(input: {
  title: string;
  body: string;
  rating: number;
  images: File[];
  maxImages: number;
}): string | null {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return "星評価は1〜5の整数で選択してください。";
  }
  if (!input.body) {
    return "レビュー本文を入力してください。";
  }
  if (input.body.length > 5000) {
    return "レビュー本文は5000文字以内で入力してください。";
  }
  if (input.title.length > 100) {
    return "タイトルは100文字以内で入力してください。";
  }
  if (input.images.length > input.maxImages) {
    return `画像は最大${input.maxImages}枚まで添付できます。`;
  }

  for (const image of input.images) {
    if (!ALLOWED_IMAGE_TYPES.includes(
      image.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )) {
      return "画像形式は JPEG / PNG / WebP / GIF のみ対応しています。";
    }
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return "画像サイズは1枚あたり5MB以内にしてください。";
    }
  }

  return null;
}

export function validateUpdateReviewInput(
  input: UpdateReviewInput,
  existingImageCount: number,
): string | null {
  if (!input.reviewId) {
    return "レビューが指定されていません。";
  }
  if (!isUuid(input.reviewId)) {
    return "レビューIDが不正です。";
  }

  const remainingSlots = MAX_REVIEW_IMAGES - existingImageCount;
  if (remainingSlots < 0) {
    return "画像枚数の上限を超えています。";
  }

  return validateReviewContent({
    title: input.title,
    body: input.body,
    rating: input.rating,
    images: input.images,
    maxImages: remainingSlots,
  });
}
