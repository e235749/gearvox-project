import {
  ALLOWED_IMAGE_TYPES,
  type AllowedImageType,
} from "@/lib/reviews/constants";

const HEIC_EXTENSIONS = [".heic", ".heif"] as const;

export function isHeicImage(file: File): boolean {
  const type = file.type.toLowerCase();

  if (type === "image/heic" || type === "image/heif") {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return HEIC_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

export function isAllowedReviewImageType(file: File): boolean {
  if (isHeicImage(file)) {
    return true;
  }

  if (!file.type) {
    return false;
  }

  return ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType);
}

export function getReviewImageFormatLabel(): string {
  return "JPEG / PNG / WebP / GIF / HEIC";
}
