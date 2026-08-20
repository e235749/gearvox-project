"use server";

import { formatReportReasonText } from "@/constants/report-reasons";
import { createClient } from "@/lib/supabase/server";
import type { SubmitReportResult } from "@/lib/reports/types";
import type { ReportTargetType } from "@/lib/reports/types";
import { validateSubmitReportInput } from "@/lib/reports/validation";
import type { Database } from "@/types/database";

type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];

async function getReviewOwnerId(reviewId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", reviewId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return (data as { user_id: string }).user_id;
}

async function getCommentOwnerId(commentId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return (data as { user_id: string }).user_id;
}

async function ensureReportTargetExists(
  targetType: ReportTargetType,
  targetId: string,
): Promise<{ exists: boolean; ownerId: string | null }> {
  if (targetType === "review") {
    const ownerId = await getReviewOwnerId(targetId);
    return { exists: ownerId !== null, ownerId };
  }

  const ownerId = await getCommentOwnerId(targetId);
  return { exists: ownerId !== null, ownerId };
}

async function hasPendingReport(
  reporterId: string,
  targetType: ReportTargetType,
  targetId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", reporterId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    console.error("[hasPendingReport]", error.message);
    return false;
  }

  return Boolean(data);
}

export async function submitReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  reasonId: string;
  otherDetail?: string;
}): Promise<SubmitReportResult> {
  const normalizedInput = {
    targetType: input.targetType,
    targetId: input.targetId.trim(),
    reasonId: input.reasonId.trim(),
    otherDetail: input.otherDetail?.trim() ?? "",
  };

  const validationError = validateSubmitReportInput(normalizedInput);

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

  const { exists, ownerId } = await ensureReportTargetExists(
    normalizedInput.targetType,
    normalizedInput.targetId,
  );

  if (!exists || !ownerId) {
    return { success: false, error: "通報対象が見つかりません。" };
  }

  if (ownerId === user.id) {
    return { success: false, error: "自分の投稿は通報できません。" };
  }

  const alreadyReported = await hasPendingReport(
    user.id,
    normalizedInput.targetType,
    normalizedInput.targetId,
  );

  if (alreadyReported) {
    return {
      success: false,
      error: "この内容はすでに通報済みです。対応までお待ちください。",
    };
  }

  const payload: ReportInsert = {
    reporter_id: user.id,
    target_type: normalizedInput.targetType,
    target_id: normalizedInput.targetId,
    reason: formatReportReasonText(
      normalizedInput.reasonId,
      normalizedInput.otherDetail,
    ),
  };

  const { error: insertError } = await supabase
    .from("reports")
    .insert(payload as never);

  if (insertError) {
    console.error("[submitReport]", insertError.message);
    return { success: false, error: "通報の送信に失敗しました。" };
  }

  return { success: true };
}
