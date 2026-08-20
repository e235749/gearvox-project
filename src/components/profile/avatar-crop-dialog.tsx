"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

import {
  buildCroppedAvatarFile,
  getCroppedAvatarBlob,
} from "@/lib/users/crop-avatar-image";

interface AvatarCropDialogProps {
  imageSrc: string;
  mimeType: string;
  onCancel: () => void;
  onComplete: (file: File, previewUrl: string) => void;
}

export function AvatarCropDialog({
  imageSrc,
  mimeType,
  onCancel,
  onComplete,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!croppedAreaPixels) {
      setError("切り抜き範囲を取得できませんでした。");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const blob = await getCroppedAvatarBlob(
        imageSrc,
        croppedAreaPixels,
        mimeType,
      );
      const file = buildCroppedAvatarFile(blob, mimeType);
      const previewUrl = URL.createObjectURL(blob);
      onComplete(file, previewUrl);
    } catch (cropError) {
      const message =
        cropError instanceof Error
          ? cropError.message
          : "画像の切り抜きに失敗しました。";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-background p-4 shadow-xl">
        <header className="space-y-1">
          <h2 className="text-lg font-medium">アイコンの範囲を調整</h2>
          <p className="text-sm text-muted">
            ドラッグで位置を、スライダーで拡大率を調整してください。
          </p>
        </header>

        <div className="relative h-72 overflow-hidden rounded-lg bg-surface">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => {
              setCroppedAreaPixels(areaPixels);
            }}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="avatar-crop-zoom" className="text-sm text-muted">
            拡大
          </label>
          <input
            id="avatar-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-accent"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
          >
            {isProcessing ? "処理中..." : "この範囲を使う"}
          </button>
        </div>
      </div>
    </div>
  );
}
