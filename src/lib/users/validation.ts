import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_LOCATION_LENGTH,
} from "@/lib/users/constants";

export interface UpdateProfileInput {
  displayName: string;
  bio: string;
  location: string;
  isPublic: boolean;
  avatar: File | null;
}

export function parseUpdateProfileForm(formData: FormData): UpdateProfileInput {
  const avatarEntry = formData.get("avatar");
  const avatar =
    avatarEntry instanceof File && avatarEntry.size > 0 ? avatarEntry : null;

  return {
    displayName: String(formData.get("display_name") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    isPublic: formData.get("is_public") === "on",
    avatar,
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
