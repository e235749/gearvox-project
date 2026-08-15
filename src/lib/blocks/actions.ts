"use server";

import { revalidatePath } from "next/cache";

import type { BlockActionResult } from "@/lib/blocks/types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BlockInsert = Database["public"]["Tables"]["blocks"]["Insert"];

function revalidateBlockPaths(targetUserId: string): void {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/users/${targetUserId}`);
  revalidatePath("/search");
}

async function removeFollowRelationships(
  userId: string,
  targetUserId: string,
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", userId)
    .eq("following_id", targetUserId);

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", targetUserId)
    .eq("following_id", userId);
}

export async function blockUser(targetUserId: string): Promise<BlockActionResult> {
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
    return { success: false, error: "自分自身をブロックすることはできません。" };
  }

  const { data: targetUser, error: targetUserError } = await supabase
    .from("users")
    .select("id")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetUserError || !targetUser) {
    return { success: false, error: "ユーザーが見つかりません。" };
  }

  const payload: BlockInsert = {
    blocker_id: user.id,
    blocked_id: targetUserId,
  };

  const { error: insertError } = await supabase
    .from("blocks")
    .insert(payload as never);

  if (insertError) {
    if (insertError.message.includes("duplicate key")) {
      return { success: true, isBlocked: true };
    }

    console.error("[blockUser] insert error:", insertError.message);
    return { success: false, error: "ブロックに失敗しました。" };
  }

  await removeFollowRelationships(user.id, targetUserId);
  revalidateBlockPaths(targetUserId);

  return { success: true, isBlocked: true };
}

export async function unblockUser(
  targetUserId: string,
): Promise<BlockActionResult> {
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
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

  if (deleteError) {
    console.error("[unblockUser] delete error:", deleteError.message);
    return { success: false, error: "ブロック解除に失敗しました。" };
  }

  revalidateBlockPaths(targetUserId);
  return { success: true, isBlocked: false };
}
