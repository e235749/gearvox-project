"use server";

import { revalidatePath } from "next/cache";

import { buildContextSnapshot } from "@/lib/reviews/build-context-snapshot";
import type { ReviewActionResult } from "@/lib/reviews/types";
import { uploadReviewImages } from "@/lib/reviews/upload-review-images";
import {
  parseCreateReviewForm,
  parseUpdateReviewForm,
  validateCreateReviewInput,
  validateUpdateReviewInput,
} from "@/lib/reviews/validation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

import { ensureUserProfile } from "@/lib/users/ensure-profile";

type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

function revalidateReviewPaths(reviewId: string, gearId: string): void {
  revalidatePath(`/reviews/${reviewId}`);
  revalidatePath(`/reviews/${reviewId}/edit`);
  revalidatePath(`/gears/${gearId}`);
  revalidatePath("/profile");
  revalidatePath("/");
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, error: "ログインが必要です。" as const };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return {
      supabase,
      user: null,
      error: "セッションが無効です。再ログインしてください。" as const,
    };
  }

  return { supabase, user, error: null };
}

async function getOwnedReview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reviewId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, gear_id")
    .eq("id", reviewId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    console.error("[review] ownership lookup error:", error.message);
    return { review: null, error: "レビューの取得に失敗しました。" as const };
  }

  if (!data) {
    return { review: null, error: "レビューが見つかりません。" as const };
  }

  const review = data as { id: string; user_id: string; gear_id: string };
  if (review.user_id !== userId) {
    return { review: null, error: "このレビューを編集する権限がありません。" as const };
  }

  return { review, error: null };
}

function logCreateReview(
  step: string,
  detail?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[createReview] ${step}`, detail ?? "");
  }
}

export async function createReview(
  _prevState: ReviewActionResult | null,
  formData: FormData,
): Promise<ReviewActionResult> {
  const input = parseCreateReviewForm(formData);

  logCreateReview("parsed input", {
    gearId: input.gearId,
    rating: input.rating,
    bodyLength: input.body.length,
    imageCount: input.images.length,
  });

  const validationError = validateCreateReviewInput(input);
  if (validationError) {
    logCreateReview("validation failed", { validationError });
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logCreateReview("auth failed", { reason: "no user" });
    return { success: false, error: "ログインが必要です。" };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    logCreateReview("auth failed", { reason: "no session" });
    return {
      success: false,
      error: "セッションが無効です。再ログインしてください。",
    };
  }

  logCreateReview("auth ok", { userId: user.id });

  const profileError = await ensureUserProfile(user);
  if (profileError) {
    console.error("[createReview] profile error:", profileError);
    return {
      success: false,
      error: `プロフィールの作成に失敗しました: ${profileError}`,
    };
  }

  const { data: gear, error: gearError } = await supabase
    .from("gears")
    .select("id, status")
    .eq("id", input.gearId)
    .maybeSingle();

  if (gearError) {
    console.error("[createReview] gear lookup error:", gearError.message);
    return { success: false, error: "ギア情報の取得に失敗しました。" };
  }

  if (!gear) {
    logCreateReview("gear not found", { gearId: input.gearId });
    return { success: false, error: "選択したギアが見つかりません。" };
  }

  const gearStatus = (gear as { id: string; status: string }).status;
  if (gearStatus !== "approved" && gearStatus !== "pending") {
    return { success: false, error: "選択したギアはレビュー投稿に使用できません。" };
  }

  const contextSnapshot = await buildContextSnapshot(user.id);

  const reviewPayload: ReviewInsert = {
    user_id: user.id,
    gear_id: input.gearId,
    title: input.title || null,
    body: input.body,
    rating: input.rating,
    context_snapshot: contextSnapshot,
  };

  const { error: insertError } = await supabase
    .from("reviews")
    .insert(reviewPayload as never);

  if (insertError) {
    console.error("[createReview] insert error:", insertError.message);
    if (insertError.message.includes("row-level security policy")) {
      return {
        success: false,
        error:
          "レビューの投稿権限がありません。ログイン状態とデータベースのRLS設定を確認してください。",
      };
    }
    return { success: false, error: insertError.message };
  }

  const { data: createdReview, error: fetchError } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("gear_id", input.gearId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("[createReview] fetch created review error:", fetchError.message);
    return {
      success: false,
      error: `レビュー作成後の取得に失敗しました: ${fetchError.message}`,
    };
  }

  if (!createdReview) {
    console.error("[createReview] insert succeeded but review not readable");
    return {
      success: false,
      error:
        "レビューは保存された可能性がありますが、読み取り権限が不足しています。RLSとGRANTを確認してください。",
    };
  }

  const reviewId = (createdReview as { id: string }).id;
  logCreateReview("insert ok", { reviewId });

  const { error: imageError } = await uploadReviewImages(
    user.id,
    reviewId,
    input.images,
  );

  if (imageError) {
    console.error("[createReview] image upload error:", imageError);
    return {
      success: false,
      error: `レビューは作成されましたが、画像の保存に失敗しました: ${imageError}`,
    };
  }

  revalidatePath("/reviews/new");
  logCreateReview("complete", { reviewId });
  return { success: true, reviewId };
}

export async function deleteReview(
  reviewId: string,
): Promise<ReviewActionResult> {
  if (!reviewId) {
    return { success: false, error: "レビューが指定されていません。" };
  }

  const auth = await getAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error ?? "ログインが必要です。" };
  }

  const owned = await getOwnedReview(auth.supabase, reviewId, auth.user.id);
  if (owned.error || !owned.review) {
    return { success: false, error: owned.error ?? "レビューが見つかりません。" };
  }

  const { error: updateError } = await auth.supabase
    .from("reviews")
    .update({ is_deleted: true } as never)
    .eq("id", reviewId)
    .eq("user_id", auth.user.id)
    .eq("is_deleted", false);

  if (updateError) {
    console.error("[deleteReview] update error:", updateError.message);
    return { success: false, error: "レビューの削除に失敗しました。" };
  }

  revalidateReviewPaths(reviewId, owned.review.gear_id);
  return { success: true, reviewId };
}

export async function updateReview(
  _prevState: ReviewActionResult | null,
  formData: FormData,
): Promise<ReviewActionResult> {
  const input = parseUpdateReviewForm(formData);

  const auth = await getAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error ?? "ログインが必要です。" };
  }

  const owned = await getOwnedReview(auth.supabase, input.reviewId, auth.user.id);
  if (owned.error || !owned.review) {
    return { success: false, error: owned.error ?? "レビューが見つかりません。" };
  }

  const { count: existingImageCount, error: imageCountError } = await auth.supabase
    .from("review_images")
    .select("id", { count: "exact", head: true })
    .eq("review_id", input.reviewId);

  if (imageCountError) {
    console.error("[updateReview] image count error:", imageCountError.message);
    return { success: false, error: "画像情報の取得に失敗しました。" };
  }

  const validationError = validateUpdateReviewInput(
    input,
    existingImageCount ?? 0,
  );
  if (validationError) {
    return { success: false, error: validationError };
  }

  const updatePayload: ReviewUpdate = {
    title: input.title || null,
    body: input.body,
    rating: input.rating,
  };

  const { error: updateError } = await auth.supabase
    .from("reviews")
    .update(updatePayload as never)
    .eq("id", input.reviewId)
    .eq("user_id", auth.user.id);

  if (updateError) {
    console.error("[updateReview] update error:", updateError.message);
    return { success: false, error: "レビューの更新に失敗しました。" };
  }

  if (input.images.length > 0) {
    const { error: imageError } = await uploadReviewImages(
      auth.user.id,
      input.reviewId,
      input.images,
      existingImageCount ?? 0,
    );

    if (imageError) {
      console.error("[updateReview] image upload error:", imageError);
      return {
        success: false,
        error: `レビューは更新されましたが、画像の保存に失敗しました: ${imageError}`,
      };
    }
  }

  revalidateReviewPaths(input.reviewId, owned.review.gear_id);
  return { success: true, reviewId: input.reviewId };
}
