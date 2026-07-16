"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AvatarCropDialog } from "@/components/profile/avatar-crop-dialog";
import { updateProfile } from "@/lib/users/actions";
import {
  ALLOWED_AVATAR_TYPES,
  type AllowedAvatarType,
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_INSTAGRAM_USERNAME_LENGTH,
  MAX_LOCATION_LENGTH,
} from "@/lib/users/constants";
import type { UserProfile } from "@/lib/users/get-profile";

interface ProfileEditFormProps {
  profile: UserProfile;
}

type CropSession = {
  imageSrc: string;
  mimeType: string;
};

function revokeBlobUrl(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    profile.avatar_url,
  );
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [cropSession, setCropSession] = useState<CropSession | null>(null);

  useEffect(() => {
    return () => {
      revokeBlobUrl(avatarPreviewUrl);
      revokeBlobUrl(cropSession?.imageSrc ?? null);
    };
  }, [avatarPreviewUrl, cropSession]);

  function resetAvatarInput() {
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type as AllowedAvatarType)) {
      setError("アイコンは JPEG / PNG / WebP / GIF のみ対応しています。");
      resetAvatarInput();
      return;
    }

    setError(null);
    revokeBlobUrl(cropSession?.imageSrc ?? null);
    setCropSession({
      imageSrc: URL.createObjectURL(file),
      mimeType: file.type,
    });
  }

  function handleCropCancel() {
    revokeBlobUrl(cropSession?.imageSrc ?? null);
    setCropSession(null);
    resetAvatarInput();
  }

  function handleCropComplete(file: File, previewUrl: string) {
    revokeBlobUrl(cropSession?.imageSrc ?? null);
    revokeBlobUrl(avatarPreviewUrl);
    setCropSession(null);
    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);
    resetAvatarInput();
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);

    if (selectedAvatarFile) {
      formData.set("avatar", selectedAvatarFile);
    } else {
      formData.delete("avatar");
    }

    try {
      const result = await updateProfile(null, formData);

      if (result.success) {
        setSuccess("プロフィールを更新しました。");
        router.push("/profile");
        router.refresh();
        return;
      }

      setError(result.error ?? "更新に失敗しました。");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      {cropSession ? (
        <AvatarCropDialog
          imageSrc={cropSession.imageSrc}
          mimeType={cropSession.mimeType}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      ) : null}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {error ? <AuthAlert message={error} /> : null}
        {success ? <AuthAlert message={success} variant="success" /> : null}

        <div className="flex items-center gap-4">
          {avatarPreviewUrl ? (
            <img
              src={avatarPreviewUrl}
              alt="プロフィールアイコン"
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-sm text-muted">
              未設定
            </span>
          )}
          <div className="space-y-2">
            <label htmlFor="avatar" className="text-sm text-muted">
              アイコン（任意）
            </label>
            <input
              ref={avatarInputRef}
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 py-2 file:text-sm file:font-medium file:text-background"
            />
            <p className="text-xs text-muted">
              選択後に表示範囲を調整できます（5MBまで）
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="display_name" className="text-sm text-muted">
            表示名
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            defaultValue={profile.display_name}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm text-muted">
            自己紹介（任意）
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={MAX_BIO_LENGTH}
            defaultValue={profile.bio ?? ""}
            placeholder="キャンプ歴や好きなスタイルなど"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm text-muted">
            居住地（任意）
          </label>
          <input
            id="location"
            name="location"
            type="text"
            maxLength={MAX_LOCATION_LENGTH}
            defaultValue={profile.location ?? ""}
            placeholder="例: 東京都"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="instagram_username" className="text-sm text-muted">
            Instagramアカウント（任意）
          </label>
          <div className="flex items-center rounded-lg border border-border bg-background px-4 py-3 text-sm focus-within:border-accent">
            <span className="text-muted">@</span>
            <input
              id="instagram_username"
              name="instagram_username"
              type="text"
              maxLength={MAX_INSTAGRAM_USERNAME_LENGTH}
              defaultValue={profile.instagram_username ?? ""}
              placeholder="camper_life"
              autoComplete="off"
              className="ml-1 w-full bg-transparent outline-none"
            />
          </div>
          <p className="text-xs text-muted">
            @ は不要です。英数字・ピリオド・アンダースコアのみ（30文字以内）
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={profile.is_public}
            className="mt-1 h-4 w-4 rounded border-border accent-accent"
          />
          <span>
            <span className="block font-medium">プロフィールを公開する</span>
            <span className="mt-1 block text-xs text-muted">
              オフにするとプロフィールページは他ユーザーから閲覧できません。レビューとコメントは引き続き表示されます。
            </span>
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
          >
            {isPending ? "保存中..." : "保存する"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50"
          >
            キャンセル
          </button>
        </div>
      </form>
    </>
  );
}
