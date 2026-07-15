"use server";

import { revalidatePath } from "next/cache";

import { buildContextSnapshot } from "@/lib/reviews/build-context-snapshot";
import type { ReviewActionResult } from "@/lib/reviews/types";
import { uploadReviewImages } from "@/lib/reviews/upload-review-images";
import {
  parseCreateReviewForm,
  validateCreateReviewInput,
} from "@/lib/reviews/validation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

import { ensureUserProfile } from "@/lib/users/ensure-profile";

type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

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
    .select("id")
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
