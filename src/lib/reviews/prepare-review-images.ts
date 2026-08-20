"use client";

import { MAX_IMAGE_SIZE_BYTES } from "@/lib/reviews/constants";
import { isHeicImage } from "@/lib/reviews/image-file";

function buildJpegFileName(fileName: string): string {
  return fileName.replace(/\.(heic|heif)$/i, "") || "image";
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });

  const blob = Array.isArray(converted) ? converted[0] : converted;

  if (!(blob instanceof Blob)) {
    throw new Error("HEIC画像の変換に失敗しました。");
  }

  return new File([blob], `${buildJpegFileName(file.name)}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

export async function prepareReviewImagesForUpload(
  files: File[],
): Promise<File[]> {
  const prepared: File[] = [];

  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("画像サイズは1枚あたり10MB以内にしてください。");
    }

    if (isHeicImage(file)) {
      const converted = await convertHeicToJpeg(file);

      if (converted.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(
          "変換後の画像が大きすぎます。別の写真をお試しください。",
        );
      }

      prepared.push(converted);
      continue;
    }

    prepared.push(file);
  }

  return prepared;
}

export function replaceReviewImagesInFormData(
  formData: FormData,
  files: File[],
): void {
  formData.delete("images");
  files.forEach((file) => {
    formData.append("images", file);
  });
}
