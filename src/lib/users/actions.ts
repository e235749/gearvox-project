"use server";

import { revalidatePath } from "next/cache";

import type { UpdateProfileResult } from "@/lib/users/types";
import { uploadAvatar } from "@/lib/users/upload-avatar";
import { ensureUserProfile } from "@/lib/users/ensure-profile";
import {
  parseUpdateProfileForm,
  validateUpdateProfileInput,
} from "@/lib/users/validation";
import { normalizeInstagramUsername } from "@/lib/users/format-instagram-username";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function updateProfile(
  _prevState: UpdateProfileResult | null,
  formData: FormData,
): Promise<UpdateProfileResult> {
  const input = parseUpdateProfileForm(formData);
  const validationError = validateUpdateProfileInput(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const profileError = await ensureUserProfile(user);
  if (profileError) {
    return {
      success: false,
      error: `プロフィールの確認に失敗しました: ${profileError}`,
    };
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (currentProfileError || !currentProfile) {
    return { success: false, error: "プロフィールの取得に失敗しました。" };
  }

  let avatarUrl = (currentProfile as { avatar_url: string | null }).avatar_url;

  if (input.avatar) {
    const { publicUrl, error: uploadError } = await uploadAvatar(
      user.id,
      input.avatar,
    );

    if (uploadError || !publicUrl) {
      return {
        success: false,
        error: `アイコンのアップロードに失敗しました: ${uploadError}`,
      };
    }

    avatarUrl = publicUrl;
  }

  const updatePayload: UserUpdate = {
    display_name: input.displayName,
    bio: input.bio || null,
    location: input.location || null,
    instagram_username: normalizeInstagramUsername(input.instagramUsername),
    is_public: input.isPublic,
    avatar_url: avatarUrl,
  };

  const { error: updateError } = await supabase
    .from("users")
    .update(updatePayload as never)
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");

  return { success: true };
}
