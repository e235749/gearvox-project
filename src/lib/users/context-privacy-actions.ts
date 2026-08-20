"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type UpdateContextPrivacyResult = {
  success: boolean;
  error?: string;
};

export async function updateContextPrivacy(
  isContextPublic: boolean,
): Promise<UpdateContextPrivacyResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const { error } = await supabase
    .from("users")
    .update({ is_context_public: isContextPublic } as never)
    .eq("id", user.id);

  if (error) {
    console.error("[updateContextPrivacy]", error.message);
    return { success: false, error: "設定の更新に失敗しました。" };
  }

  revalidatePath("/profile");
  return { success: true };
}
