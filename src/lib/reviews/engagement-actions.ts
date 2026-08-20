"use server";

import { revalidatePath } from "next/cache";

import { listReviewComments } from "@/lib/comments/list-review-comments";
import type {
  CommentActionResult,
  FetchCommentsResult,
} from "@/lib/comments/types";
import { validateCommentBody } from "@/lib/comments/validation";
import type { LikeActionResult } from "@/lib/likes/types";
import { createNotification } from "@/lib/notifications/create-notification";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type LikeInsert = Database["public"]["Tables"]["likes"]["Insert"];
type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];

function revalidateReviewPaths(reviewId: string): void {
  revalidatePath("/");
  revalidatePath(`/reviews/${reviewId}`);
  revalidatePath("/profile");
  revalidatePath("/notifications");
}

async function getReviewOwnerId(reviewId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", reviewId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[getReviewOwnerId]", error.message);
    }
    return null;
  }

  return (data as { user_id: string }).user_id;
}

async function getLikeCount(reviewId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("review_id", reviewId);

  if (error) {
    console.error("[getLikeCount]", error.message);
    return 0;
  }

  return count ?? 0;
}

async function getCommentCount(reviewId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("review_id", reviewId)
    .eq("is_deleted", false);

  if (error) {
    console.error("[getCommentCount]", error.message);
    return 0;
  }

  return count ?? 0;
}

async function ensureReviewExists(reviewId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    console.error("[ensureReviewExists]", error.message);
    return false;
  }

  return Boolean(data);
}

export async function toggleReviewLike(
  reviewId: string,
): Promise<LikeActionResult> {
  if (!reviewId) {
    return { success: false, error: "レビューが指定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const reviewExists = await ensureReviewExists(reviewId);

  if (!reviewExists) {
    return { success: false, error: "レビューが見つかりません。" };
  }

  const { data: existingLike, error: existingLikeError } = await supabase
    .from("likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLikeError) {
    console.error("[toggleReviewLike] select error:", existingLikeError.message);
    return { success: false, error: "いいねの更新に失敗しました。" };
  }

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[toggleReviewLike] delete error:", deleteError.message);
      return { success: false, error: "いいねの解除に失敗しました。" };
    }

    revalidateReviewPaths(reviewId);
    return {
      success: true,
      isLiked: false,
      likeCount: await getLikeCount(reviewId),
    };
  }

  const payload: LikeInsert = {
    review_id: reviewId,
    user_id: user.id,
  };

  const { error: insertError } = await supabase
    .from("likes")
    .insert(payload as never);

  if (insertError) {
    if (insertError.message.includes("duplicate key")) {
      return {
        success: true,
        isLiked: true,
        likeCount: await getLikeCount(reviewId),
      };
    }

    console.error("[toggleReviewLike] insert error:", insertError.message);
    return { success: false, error: "いいねに失敗しました。" };
  }

  const reviewOwnerId = await getReviewOwnerId(reviewId);

  if (reviewOwnerId) {
    await createNotification({
      recipientUserId: reviewOwnerId,
      actorId: user.id,
      type: "like",
      reviewId,
    });
  }

  revalidateReviewPaths(reviewId);
  return {
    success: true,
    isLiked: true,
    likeCount: await getLikeCount(reviewId),
  };
}

export async function fetchReviewComments(
  reviewId: string,
): Promise<FetchCommentsResult> {
  if (!reviewId) {
    return { success: false, error: "レビューが指定されていません。" };
  }

  const reviewExists = await ensureReviewExists(reviewId);

  if (!reviewExists) {
    return { success: false, error: "レビューが見つかりません。" };
  }

  const comments = await listReviewComments(reviewId);
  return { success: true, comments };
}

export async function postReviewComment(
  reviewId: string,
  body: string,
): Promise<CommentActionResult> {
  const validationError = validateCommentBody(body);

  if (validationError) {
    return { success: false, error: validationError };
  }

  if (!reviewId) {
    return { success: false, error: "レビューが指定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です。" };
  }

  const reviewExists = await ensureReviewExists(reviewId);

  if (!reviewExists) {
    return { success: false, error: "レビューが見つかりません。" };
  }

  const payload: CommentInsert = {
    review_id: reviewId,
    user_id: user.id,
    body: body.trim(),
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(payload as never)
    .select("id, body, created_at, user_id, users(id, display_name)")
    .single();

  if (error || !data) {
    console.error("[postReviewComment] insert error:", error?.message);
    return { success: false, error: "コメントの投稿に失敗しました。" };
  }

  const row = data as {
    id: string;
    body: string;
    created_at: string;
    user_id: string;
    users: { id: string; display_name: string } | null;
  };

  const reviewOwnerId = await getReviewOwnerId(reviewId);

  if (reviewOwnerId) {
    await createNotification({
      recipientUserId: reviewOwnerId,
      actorId: user.id,
      type: "comment",
      reviewId,
    });
  }

  revalidateReviewPaths(reviewId);

  return {
    success: true,
    comment: {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      author: {
        id: row.users?.id ?? row.user_id,
        display_name: row.users?.display_name ?? "ユーザー",
      },
    },
    commentCount: await getCommentCount(reviewId),
  };
}
