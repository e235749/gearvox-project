import type { Area } from "react-easy-crop";

import { AVATAR_OUTPUT_SIZE } from "@/lib/users/constants";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => {
      reject(new Error("画像の読み込みに失敗しました。"));
    });
    image.src = url;
  });
}

export async function getCroppedAvatarBlob(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: string,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("画像の加工に失敗しました。");
  }

  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("画像の加工に失敗しました。"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      0.92,
    );
  });
}

export function buildCroppedAvatarFile(
  blob: Blob,
  mimeType: string,
): File {
  const extension = mimeType.split("/")[1] ?? "jpeg";
  return new File([blob], `avatar.${extension}`, { type: mimeType });
}
