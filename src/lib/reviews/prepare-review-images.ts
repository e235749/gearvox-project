"use client";

import { MAX_IMAGE_SIZE_BYTES } from "@/lib/reviews/constants";
import { isHeicImage } from "@/lib/reviews/image-file";

/** 圧縮後の目標（これ以下なら追加圧縮を弱める） */
const TARGET_MAX_BYTES = 1_200_000;
/** 長辺の上限 */
const MAX_EDGE_PX = 1920;
/** JPEG 品質 */
const JPEG_QUALITY = 0.82;

function buildJpegFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.jpg`;
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

  return new File([blob], buildJpegFileName(file.name), {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました。"));
    };
    image.src = url;
  });
}

async function compressImageFile(file: File): Promise<File> {
  // GIF はアニメーションを壊さないよう圧縮スキップ（小さい場合）
  if (file.type === "image/gif" && file.size <= TARGET_MAX_BYTES) {
    return file;
  }

  const image = await loadImageElement(file);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longest > MAX_EDGE_PX ? MAX_EDGE_PX / longest : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("画像の圧縮に失敗しました。");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), "image/jpeg", quality);
  });

  // まだ大きい場合は品質を段階的に下げる
  while (blob && blob.size > TARGET_MAX_BYTES && quality > 0.55) {
    quality -= 0.1;
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((value) => resolve(value), "image/jpeg", quality);
    });
  }

  if (!blob) {
    throw new Error("画像の圧縮に失敗しました。");
  }

  // 圧縮結果が元より大きい場合は元を使う（非JPEGの小さな画像など）
  if (blob.size >= file.size && file.type === "image/jpeg" && scale === 1) {
    return file;
  }

  return new File([blob], buildJpegFileName(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/**
 * HEIC変換 + 軽いリサイズ/圧縮。
 * Server Action を経由せず Storage 直送するための前処理。
 */
export async function prepareReviewImagesForUpload(
  files: File[],
): Promise<File[]> {
  const prepared: File[] = [];

  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("画像サイズは1枚あたり10MB以内にしてください。");
    }

    let working = file;

    if (isHeicImage(file)) {
      working = await convertHeicToJpeg(file);
      if (working.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(
          "変換後の画像が大きすぎます。別の写真をお試しください。",
        );
      }
    }

    const compressed = await compressImageFile(working);

    if (compressed.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(
        "最適化後も画像が大きすぎます。枚数を減らすか、別の写真をお試しください。",
      );
    }

    prepared.push(compressed);
  }

  return prepared;
}
