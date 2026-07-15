"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { updateProfile } from "@/lib/users/actions";
import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_LOCATION_LENGTH,
} from "@/lib/users/constants";
import type { UserProfile } from "@/lib/users/get-profile";

interface ProfileEditFormProps {
  profile: UserProfile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setIsPending(true);

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
    <form action={handleSubmit} className="space-y-6">
      {error ? <AuthAlert message={error} /> : null}
      {success ? <AuthAlert message={success} variant="success" /> : null}

      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
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
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
          />
          <p className="text-xs text-muted">
            5MBまで（JPEG / PNG / WebP / GIF）
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
  );
}
