"use server";

import { revalidatePath } from "next/cache";

import type { GearActionResult } from "@/lib/gears/types";
import {
  parseApproveGearForm,
  parseCreatePendingGearForm,
  validateApproveGearInput,
  validateCreatePendingGearInput,
} from "@/lib/gears/validation";
import { isUserAdmin } from "@/lib/users/is-admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type GearInsert = Database["public"]["Tables"]["gears"]["Insert"];
type GearUpdate = Database["public"]["Tables"]["gears"]["Update"];

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

async function requireAdmin() {
  const auth = await getAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { ...auth, isAdmin: false };
  }

  const isAdmin = await isUserAdmin(auth.user.id);
  if (!isAdmin) {
    return {
      supabase: auth.supabase,
      user: auth.user,
      error: "管理者権限が必要です。" as const,
      isAdmin: false,
    };
  }

  return { ...auth, error: null, isAdmin: true };
}

function revalidateGearPaths(gearId?: string): void {
  revalidatePath("/reviews/new");
  revalidatePath("/search");
  revalidatePath("/admin/gears");
  if (gearId) {
    revalidatePath(`/gears/${gearId}`);
  }
}

export async function createPendingGear(
  _prevState: GearActionResult | null,
  formData: FormData,
): Promise<GearActionResult> {
  const input = parseCreatePendingGearForm(formData);
  const validationError = validateCreatePendingGearInput(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const auth = await getAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error ?? "ログインが必要です。" };
  }

  if (input.categoryId) {
    const { data: category, error: categoryError } = await auth.supabase
      .from("gear_categories")
      .select("id")
      .eq("id", input.categoryId)
      .maybeSingle();

    if (categoryError || !category) {
      return { success: false, error: "選択したカテゴリが見つかりません。" };
    }
  }

  const payload: GearInsert = {
    name: input.name,
    brand: input.brand || null,
    category_id: input.categoryId,
    status: "pending",
    submitted_by: auth.user.id,
    submitted_name: input.name,
  };

  const { data, error } = await auth.supabase
    .from("gears")
    .insert(payload as never)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("[createPendingGear] insert error:", error?.message);
    return { success: false, error: "ギアの登録に失敗しました。" };
  }

  const gearId = (data as { id: string }).id;
  revalidateGearPaths(gearId);
  return { success: true, gearId };
}

export async function approveGear(
  _prevState: GearActionResult | null,
  formData: FormData,
): Promise<GearActionResult> {
  const input = parseApproveGearForm(formData);
  const validationError = validateApproveGearInput(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const auth = await requireAdmin();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  const { data: gear, error: gearError } = await auth.supabase
    .from("gears")
    .select("id, status")
    .eq("id", input.gearId)
    .maybeSingle();

  if (gearError || !gear) {
    return { success: false, error: "ギアが見つかりません。" };
  }

  const current = gear as { id: string; status: string };
  if (current.status !== "pending") {
    return { success: false, error: "承認対象のギアが不正です。" };
  }

  const updatePayload: GearUpdate = {
    name: input.name,
    brand: input.brand || null,
    category_id: input.categoryId,
    status: "approved",
  };

  const { error: updateError } = await auth.supabase
    .from("gears")
    .update(updatePayload as never)
    .eq("id", input.gearId);

  if (updateError) {
    console.error("[approveGear] update error:", updateError.message);
    return { success: false, error: "ギアの承認に失敗しました。" };
  }

  revalidateGearPaths(input.gearId);
  return { success: true, gearId: input.gearId };
}

export async function mergeGear(
  pendingGearId: string,
  canonicalGearId: string,
): Promise<GearActionResult> {
  if (!pendingGearId || !canonicalGearId) {
    return { success: false, error: "ギアが指定されていません。" };
  }

  if (pendingGearId === canonicalGearId) {
    return { success: false, error: "同じギアにはマージできません。" };
  }

  const auth = await requireAdmin();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  const { data: pendingGear, error: pendingError } = await auth.supabase
    .from("gears")
    .select("id, status")
    .eq("id", pendingGearId)
    .maybeSingle();

  if (pendingError || !pendingGear) {
    return { success: false, error: "マージ元のギアが見つかりません。" };
  }

  const pending = pendingGear as { id: string; status: string };
  if (pending.status !== "pending") {
    return { success: false, error: "マージ元のギアが不正です。" };
  }

  const { data: canonicalGear, error: canonicalError } = await auth.supabase
    .from("gears")
    .select("id, status")
    .eq("id", canonicalGearId)
    .maybeSingle();

  if (canonicalError || !canonicalGear) {
    return { success: false, error: "マージ先のギアが見つかりません。" };
  }

  const canonical = canonicalGear as { id: string; status: string };
  if (canonical.status !== "approved") {
    return { success: false, error: "マージ先は承認済みギアを選択してください。" };
  }

  const { error: reviewUpdateError } = await auth.supabase
    .from("reviews")
    .update({ gear_id: canonicalGearId } as never)
    .eq("gear_id", pendingGearId);

  if (reviewUpdateError) {
    console.error("[mergeGear] review update error:", reviewUpdateError.message);
    return { success: false, error: "レビューの紐付け更新に失敗しました。" };
  }

  const { error: gearUpdateError } = await auth.supabase
    .from("gears")
    .update({
      status: "merged",
      canonical_gear_id: canonicalGearId,
    } as never)
    .eq("id", pendingGearId);

  if (gearUpdateError) {
    console.error("[mergeGear] gear update error:", gearUpdateError.message);
    return { success: false, error: "ギアのマージに失敗しました。" };
  }

  revalidateGearPaths(pendingGearId);
  revalidateGearPaths(canonicalGearId);
  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true, gearId: canonicalGearId };
}

export async function rejectGear(gearId: string): Promise<GearActionResult> {
  if (!gearId) {
    return { success: false, error: "ギアが指定されていません。" };
  }

  const auth = await requireAdmin();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  const { data: gear, error: gearError } = await auth.supabase
    .from("gears")
    .select("id, status")
    .eq("id", gearId)
    .maybeSingle();

  if (gearError || !gear) {
    return { success: false, error: "ギアが見つかりません。" };
  }

  const current = gear as { id: string; status: string };
  if (current.status !== "pending") {
    return { success: false, error: "却下対象のギアが不正です。" };
  }

  const { count, error: reviewCountError } = await auth.supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("gear_id", gearId)
    .eq("is_deleted", false);

  if (reviewCountError) {
    return { success: false, error: "レビュー件数の取得に失敗しました。" };
  }

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: "レビューが紐づいているギアは却下できません。既存ギアへのマージを行ってください。",
    };
  }

  const { error: updateError } = await auth.supabase
    .from("gears")
    .update({ status: "rejected" } as never)
    .eq("id", gearId);

  if (updateError) {
    console.error("[rejectGear] update error:", updateError.message);
    return { success: false, error: "ギアの却下に失敗しました。" };
  }

  revalidateGearPaths(gearId);
  return { success: true, gearId };
}
