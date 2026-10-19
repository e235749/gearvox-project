"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/lib/auth/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AVATARS_BUCKET } from "@/lib/users/constants";

const REVIEW_IMAGES_BUCKET = "review-images";
const CONFIRM_PHRASE = "削除";

type StorageItem = {
  name: string;
  id: string | null;
};

async function collectStoragePaths(
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const admin = createAdminClient();
  const paths: string[] = [];

  async function walk(folder: string): Promise<void> {
    const { data, error } = await admin.storage.from(bucket).list(folder, {
      limit: 1000,
    });

    if (error || !data) {
      return;
    }

    for (const item of data as StorageItem[]) {
      const path = folder ? `${folder}/${item.name}` : item.name;
      if (item.id === null) {
        await walk(path);
        continue;
      }
      paths.push(path);
    }
  }

  await walk(prefix);
  return paths;
}

async function removeUserFiles(userId: string): Promise<void> {
  const admin = createAdminClient();

  for (const bucket of [REVIEW_IMAGES_BUCKET, AVATARS_BUCKET]) {
    const paths = await collectStoragePaths(bucket, userId);
    if (paths.length === 0) {
      continue;
    }
    await admin.storage.from(bucket).remove(paths);
  }
}

export async function deleteAccount(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== CONFIRM_PHRASE) {
    return { error: `確認のため「${CONFIRM_PHRASE}」と入力してください。` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  try {
    const admin = createAdminClient();
    await removeUserFiles(user.id);
    await admin
      .from("reports")
      .delete()
      .eq("target_type", "user")
      .eq("target_id", user.id);

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return { error: "アカウントの削除に失敗しました。時間をおいて再度お試しください。" };
    }
  } catch (error) {
    console.error("[deleteAccount]", error);
    return { error: "アカウントの削除に失敗しました。時間をおいて再度お試しください。" };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`${AUTH_ROUTES.login}?deleted=1`);
}
