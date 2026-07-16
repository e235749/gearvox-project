import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_INSTAGRAM_USERNAME_LENGTH,
  MAX_LOCATION_LENGTH,
} from "@/lib/users/constants";
import {
  isValidInstagramUsername,
  normalizeInstagramUsername,
} from "@/lib/users/format-instagram-username";

export interface UpdateProfileInput {
  displayName: string;
  bio: string;
  location: string;
  instagramUsername: string;
  isPublic: boolean;
  avatar: File | null;
}

function getAvatarFileFromFormData(formData: FormData): File | null {
  const entry = formData.get("avatar");

  if (!(entry instanceof Blob) || entry.size === 0) {
    return null;
  }

  if (entry instanceof File) {
    return entry;
  }

  const blob = entry as Blob;
  const type = blob.type || "image/jpeg";
  const extension = type.split("/")[1] ?? "jpeg";

  return new File([blob], `avatar.${extension}`, { type });
}

export function parseUpdateProfileForm(formData: FormData): UpdateProfileInput {
  return {
    displayName: String(formData.get("display_name") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    instagramUsername: String(formData.get("instagram_username") ?? "").trim(),
    isPublic: formData.get("is_public") === "on",
    avatar: getAvatarFileFromFormData(formData),
  };
}

export function validateUpdateProfileInput(
  input: UpdateProfileInput,
): string | null {
  if (!input.displayName) {
    return "表示名を入力してください。";
  }
  if (input.displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return `表示名は${MAX_DISPLAY_NAME_LENGTH}文字以内で入力してください。`;
  }
  if (input.bio.length > MAX_BIO_LENGTH) {
    return `自己紹介は${MAX_BIO_LENGTH}文字以内で入力してください。`;
  }
  if (input.location.length > MAX_LOCATION_LENGTH) {
    return `居住地は${MAX_LOCATION_LENGTH}文字以内で入力してください。`;
  }

  const normalizedInstagram = normalizeInstagramUsername(
    input.instagramUsername,
  );
  if (normalizedInstagram) {
    if (normalizedInstagram.length > MAX_INSTAGRAM_USERNAME_LENGTH) {
      return `Instagramアカウント名は${MAX_INSTAGRAM_USERNAME_LENGTH}文字以内で入力してください。`;
    }
    if (!isValidInstagramUsername(normalizedInstagram)) {
      return "Instagramアカウント名は英数字・ピリオド・アンダースコアのみ使用できます。";
    }
  }

  if (input.avatar) {
    if (
      !ALLOWED_AVATAR_TYPES.includes(
        input.avatar.type as (typeof ALLOWED_AVATAR_TYPES)[number],
      )
    ) {
      return "アイコンは JPEG / PNG / WebP / GIF のみ対応しています。";
    }
    if (input.avatar.size > MAX_AVATAR_SIZE_BYTES) {
      return "アイコンは5MB以内にしてください。";
    }
  }

  return null;
}
