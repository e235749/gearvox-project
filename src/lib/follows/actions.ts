"use server";

import { revalidatePath } from "next/cache";

import type { FollowActionResult } from "@/lib/follows/types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type FollowInsert = Database["public"]["Tables"]["follows"]["Insert"];

function revalidateFollowPaths(targetUserId: string): void {
  revalidatePath("/");
  revalidatePath(`/users/${targetUserId}`);
}

export async function followUser(targetUserId: string): Promise<FollowActionResult> {
  if (!targetUserId) {
    return { success: false, error: "ユーザーが指定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  if (user.id === targetUserId) {
    return { success: false, error: "自分自身をフォローすることはできません。" };
  }

  const { data: targetUser, error: targetUserError } = await supabase
    .from("users")
    .select("id")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetUserError || !targetUser) {
    return { success: false, error: "ユーザーが見つかりません。" };
  }

  const payload: FollowInsert = {
    follower_id: user.id,
    following_id: targetUserId,
  };

  const { error: insertError } = await supabase
    .from("follows")
    .insert(payload as never);

  if (insertError) {
    if (insertError.message.includes("duplicate key")) {
      return { success: true, isFollowing: true };
    }
    console.error("[followUser] insert error:", insertError.message);
    return { success: false, error: "フォローに失敗しました。" };
  }

  revalidateFollowPaths(targetUserId);
  return { success: true, isFollowing: true };
}

export async function unfollowUser(
  targetUserId: string,
): Promise<FollowActionResult> {
  if (!targetUserId) {
    return { success: false, error: "ユーザーが指定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const { error: deleteError } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (deleteError) {
    console.error("[unfollowUser] delete error:", deleteError.message);
    return { success: false, error: "フォロー解除に失敗しました。" };
  }

  revalidateFollowPaths(targetUserId);
  return { success: true, isFollowing: false };
}
